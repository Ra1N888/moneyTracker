import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { useSelector } from 'react-redux'
import throttle from 'lodash/throttle';
import routes from '../router/routes';
import SignIn from 'features/user/containers/SignIn';
import InitialSetup from './InitialSetup';
import SidebarMenu from './SidebarMenu';
import Header from '../components/Header';
import DemoNotice from './DemoNotice';
import SyncWarning from './SyncWarning';
import { windowResize } from '../actions/ui/windowResize';
import { toggleSidebar } from '../actions/ui/sidebar';
import { bootstrap } from '../actions/app';


const AppTs = (history: any) => {

  const isLoaded = useSelector((state: any) => state.settings.isLoaded)
  const isSyncRunning = useSelector((state: any) => state.settings.isRunning)
  const isSetupComplete = useSelector((state: any) => state.settings.isSetupComplete)
  const isMobile = useSelector((state: any) => state.settings.isMobile)
  const isSidebarOpen = useSelector((state: any) => state.settings.isSidebarOpen)


  useEffect(() => {
    window.addEventListener('resize', throttle(windowResize, 500))
    bootstrap()
  })


  return (
    <div>
      {isLoaded ?
        <Loader
          active
          content={isSyncRunning && 'Synchronizing data, this might take a moment...'}
        /> :
        <Router history={history}>
          <Switch>
            <Route path="/auth" exact={true} component={SignIn} />

            {!isSetupComplete ? 
              <Route component={InitialSetup} />
             : 
              <Route children={<NavigationRoutes isMobile={isMobile} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>} />
            }
          </Switch>
        </Router>

      }

    </div>
  )
}

interface Props1{
  isMobile: boolean
  isSidebarOpen: boolean
  toggleSidebar: any
}

const NavigationRoutes = ({isMobile, isSidebarOpen, toggleSidebar}:Props1)=>{

  return(
    <div>
      {(window.location.pathname.endsWith('index.html'))?
      <Redirect to="/" />
      :
      <div>
         <Dimmer
          page
          active={isMobile && isSidebarOpen}
          onClick={toggleSidebar}
          style={{ zIndex: 100 }}
        />
        <SidebarMenu
          isOpen={!isMobile || isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        {flatten(routes).map((route: any)=> (
          <Route
            key={route.path}
            path={route.path}
            exact={route.exact}
            render={props => (
              <React.Fragment>
                <Header label={route.label} />
                <div className="container">
                  <DemoNotice />
                  <SyncWarning />
                  <route.component {...props} />
                </div>
              </React.Fragment>
            )}
          />
        ))}
      </div>
      }
    </div>
  )
}


function flatten(routes: any) {
  let flatRoutes: any = [];
  routes.forEach((route: any) => {
    if (route.routes) {
      flatRoutes.push({ ...route, exact: true });
      flatRoutes.push(...flatten(route.routes));
    } else {
      flatRoutes.push(route);
    }
  });

  return flatRoutes;
}


export default AppTs