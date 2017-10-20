#!/bin/bash

CRIPT=`realpath $0`
SCRIPT_PATH=`dirname $SCRIPT`
SHELF_DIR=/var/local/shelf

if [ $EUID -ne 0 ]; then
  echo "This scritp must be run as root"
  exit 1;
fi

if [ ! -d $SHELF_DIR/frontend ]; then 
  echo "Shelf folder is not found, installed? $SHELF_DIR/frontend";
  exit 1;
fi

cd $SHELF_DIR
git pull | grep -F 'Already up-to-date.'

if [ $? eq 0 ]; then
  echo "Nothing to update."
  exit 0;
fi

cd $SHELF_DIR/frontend
npm install
./node_modules/.bin/ng build -prod

# TODO: if backend is not updated, no need to migrate and restart
cd $SHELF_DIR/backend
npm install
./node_modules/.bin/sequelize db:migrate

echo "Restarting services..."
systemctl restart shelf.service

