import React from 'react';

import {Link, Route, Switch, useHistory, useRouteMatch} from "react-router-dom";
import {Breadcrumb, Icon, Layout, Menu} from 'antd';

import './AdminPage.css';

const {Content, Sider} = Layout;
const {SubMenu} = Menu;

export default function () {
    const match = useRouteMatch();
    const history = useHistory();
    return (
        <Layout>
            <Sider collapsible>
                <div className="logo"/>
                <Menu theme="dark" mode="inline">
                    <Menu.Item key="1" onClick={() => history.push(`${match.url}/projects`)}>
                        <Icon type="pie-chart"/>
                        <span>Projects</span>
                    </Menu.Item>
                    <Menu.Item key="2" onClick={() => history.push(`${match.url}/teams`)}>
                        <Icon type="pie-chart"/>
                        <span>Teams</span>
                    </Menu.Item>
                    <SubMenu
                        key="sub1"
                        title={
                            <span>
                                <Icon type="user"/>
                                <span>Users</span>
                            </span>
                        }>
                        <Menu.Item key="3">Tom</Menu.Item>
                        <Menu.Item key="4">Hello</Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
            <Layout>
                <Content style={{margin: '0 16px'}}>
                    <Breadcrumb style={{margin: '16px 0'}}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <Switch>
                        <Route path={`${match.path}/projects`} render={() => <h1>Projects</h1>}/>
                        <Route path={`${match.path}/teams`} render={() => <h1>Teams</h1>}/>
                    </Switch>
                </Content>
            </Layout>
        </Layout>
    );
};
