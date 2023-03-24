import { tagsDB, remoteTagsDB, destroyTagsDB } from './pouchdb';

export default {
  sync, // 返回布尔值 hasChanges
  load, // 根据kind，load all tags
  updateUsage, // update或者是creat，取决存不存在
  destroy
};

async function sync(readOnly = false) {
  let hasChanges = false;
  if (!remoteTagsDB()) return hasChanges;

  // remote => local
  const from = await tagsDB().replicate.from(remoteTagsDB());
  if (from.docs_written > 0) hasChanges = true;
  
  if (readOnly) return hasChanges;

  // local => remote
  await tagsDB().replicate.to(remoteTagsDB());

  return hasChanges;
}

function destroy() {
  return destroyTagsDB();
}

function load(kind) {
  return tagsDB()
    .allDocs({
      include_docs: true,
      start_key: `t${kind}`,
      end_key: `t${kind}\uffff`
    })
    .then(response =>
      response.rows.map(row => ({
        tag: row.doc._id.split('/')[1],
        usage: row.doc.usage
      }))
    )
    .then(docs => docs.sort((a, b) => b.usage - a.usage))
    .then(docs => docs.map(doc => doc.tag));
}

function updateUsage(kind, tag, delta) {
  const id = `t${kind}/${tag}`; // 't0/食物’
  return tagsDB()
    .get(id)
    .then(doc =>
      tagsDB().put({ ...doc, usage: parseInt(doc.usage, 10) + delta })
    )
    .catch(err => {
      if (err.status !== 404) throw err;

      return tagsDB().put({ _id: id, usage: 1 });
    });
}
