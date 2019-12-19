import React, {Component} from 'react';
import './App.css';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Link, Route} from "react-router-dom";
import {Layout, Menu, Button} from 'antd';
import 'antd/dist/antd.css';

import Login from './LoginView'
import {fetchProfile, userLogout} from "./store/actions/profile";

const {Header, Content, Footer} = Layout;

class App extends Component {

    componentDidMount() {
        this.props.fetchProfile();
    }

    render() {
        if(this.props.app.loading) {
            return <h1>Loading...</h1> /*<FullPageLoading />*/
        }

        if (!this.props.profile.user) {
            return <Login/>
        }

        return (
            <Router>
                <div className="App">
                    <Layout>
                        <Header style={{position: 'fixed', zIndex: 1, width: '100%'}}>
                            <div style={{display: "flex"}}>
                                <Menu mode="horizontal" theme="dark"
                                      defaultSelectedKeys={['1']}
                                      style={{lineHeight: '64px'}}>
                                    <Menu.Item key="1"><Link to='/project'>Project</Link></Menu.Item>
                                    <Menu.Item key="2"><Link to='/g/main'>Admin</Link></Menu.Item>
                                </Menu>
                                <div style={{flexGrow: 1}}/>
                                <Menu mode="horizontal" theme="dark" style={{lineHeight: '64px', float: "right"}}>
                                    <Menu.Item key="1" disabled="true">{this.props.profile.user.displayName}</Menu.Item>
                                    <Menu.Item key="1"><Button type="link" size="large" onClick={this.props.logout} className="logout-button">Logout</Button></Menu.Item>
                                </Menu>
                            </div>
                        </Header>
                        <Content style={{padding: '0 50px', marginTop: 64}}>
                            <Route path='/project' render={() => {
                                return <div style={{background: '#fff', padding: 24, minHeight: 380}}>Content</div>
                            }}/>
                            <Route path='/g/second' render={() => {
                                return <h1>Second</h1>
                            }}/>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>About</Footer>
                    </Layout>
                </div>
            </Router>
        );
    }
}

const mapStateToProps = state => ({
    profile: state.profile,
    app: state.app,
});

const mapDispatchToProps = dispatch => ({
    fetchProfile: () => dispatch(fetchProfile()),
    logout: () => dispatch(userLogout())
});

export default App = connect(mapStateToProps, mapDispatchToProps)(App);
