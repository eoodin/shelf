import React, {Component} from 'react';
import './App.css';
import {connect} from 'react-redux';
import {BrowserRouter as Router, Link, Route} from "react-router-dom";
import {Layout, Menu} from 'antd';
import 'antd/dist/antd.css';

import Login from './LoginView'

const {Header, Content, Footer} = Layout;

class App extends Component {
    render() {
        if (!this.props.user) {
            return <Login/>
        }

        return (
            <Router>
                <div className="App">
                    <Layout>
                        <Header style={{position: 'fixed', zIndex: 1, width: '100%'}}>
                            <div className="logo"/>
                            <Menu mode="horizontal" theme="dark"
                                  defaultSelectedKeys={['1']}
                                  style={{lineHeight: '64px'}}>
                                <Menu.Item key="1"><Link to='/project'>Project</Link></Menu.Item>
                                <Menu.Item key="2"><Link to='/g/main'>Admin</Link></Menu.Item>
                            </Menu>
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
    user: state.user,
});


export default App = connect(mapStateToProps)(App);
