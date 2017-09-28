#!/bin/bash

SCRIPT=`realpath $0`
SCRIPT_PATH=`dirname $SCRIPT`
SHELF_DIR=/var/local/shelf

if [ $EUID -ne 0 ]; then
  echo "This scritp must be run as root"
  exit 1;
fi

pidof systemd >/dev/null 2>&1
if [ $? -ne 0 ]; then 
  echo "Install script only work with systemd"; 
  exit 1;
fi

SYSD_CONF=/etc/systemd/system
SYSD_BACKEND=$SYSD_CONF/shelf.service
NGINX_SITES=/etc/nginx/sites-available

if [ ! -d $NGINX_SITES ]; then
  echo "nginx is not installed"
  exit 1;
fi

if [ ! `which npm` ]; then
  echo "npm/nodejs not installed, please install nodejs (ver>=8)"
  exit 1;
fi

stat $SYSD_BACKEND >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "backend service already exist, remove it first";
  exit 1;
fi

stat $SYSD_FRONTEND >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "frontend service already exist, remove it first";
  exit 1;
fi

cp $SCRIPT_PATH/config/backend.service $SYSD_BACKEND

if [ ! -d $SHELF_DIR ]; then
  echo "Create shelf folder: $SHELF_DIR";
  mkdir -p $SHELF_DIR;
fi

npm install $SCRIPT_PATH/../frontend
if [ -d $SHELF_DIR/frontend ]; then 
  echo "frontend folder exist, remove it.."
  rm -rf $SHELF_DIR/frontend;
fi

cd $SCRIPT_PATH/../frontend
./node_modules/.bin/ng build -prod --output-path $SHELF_DIR/frontend

cp $SCRIPT_PATH/config/nginx.conf $NGINX_SITES/shelf
echo "disable those sites: `ls $NGINX_SITES/../sites-enabled`"
unlink $NGINX_SITES/../sites-enabled/*
ln -s $NGINX_SITES/shelf $NGINX_SITES/../sites-enabled/shelf

cp -r $SCRIPT_PATH/../backend $SHELF_DIR/
npm install $SHELF_DIR/backend
mkdir /var/log/shelf
mkdir $SHELF_DIR/backend/config
cp $SCRIPT_PATH/config/secure.json $SHELF_DIR/backend/config/
echo "$SHELF_DIR/backend/config/secure.json created for authentication.";
read -p "Press any key after modification or delete the file..."

# TODO: 
# create schema
# migrate
#./node_modules/.bin/sequelize

systemctl enable shelf.service

echo "Starting services"
systemctl daemon-reload
systemctl restart nginx.service
systemctl start shelf.service
