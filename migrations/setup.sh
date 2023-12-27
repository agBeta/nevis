#!/bin/bash
# First creates a database and a database user. 
# ? Second grants all previliges to the created user (Don't do this for production)
# Then performs all migrations specified in the current folder step-by-step.

# Skeleton of first part (creating database and user) is copied from https://stackoverflow.com/a/33474729.
# Though some changes are made.

# The part (i.e. performing migrations sql files) is based on these links:
# https://stackoverflow.com/questions/8147834/how-to-echo-print-statements-while-executing-a-sql-script/37378009#37378009.
# https://stackoverflow.com/questions/7616520/how-to-execute-a-sql-script-from-bash.
# https://stackoverflow.com/questions/14505047/loop-through-all-the-files-with-a-specific-extension.


# Based on https://stackoverflow.com/a/5947802.
RED='\033[0;31m'
Blue='\033[0;34m' 
Blue_bg='\033[44m'
NC='\033[0m' # No Color


echo "Welcome!"
echo "Plase answer the following questions based on your chosen test or development \".env\" file."
echo "In other words, entered values must be the same as environment variables that are used in your nodejs scripts."
echo ""
# If /root/.my.cnf exists then it won't ask for root password
if [ -f /root/.my.cnf ]; then
	echo "Enter database name: (MYSQL_DB_NAME from .env)"
    echo -e "${RED}WARNING: The database will be dropped if it already exists.${NC}"
	read dbname
	mysql -e "DROP DATABASE IF EXISTS ${dbname} ;"
	mysql -e "CREATE DATABASE ${dbname} ;"

	echo ""
	echo "Enter database username: (MYSQL_USERNAME)"
	read username
    echo ""
	echo "Enter database user password: (MYSQL_PASSWORD)"
	read userpass

	mysql -e "CREATE USER IF NOT EXISTS ${username}@localhost IDENTIFIED BY '${userpass}' ;"
	mysql -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'localhost' ;"
	mysql -e "FLUSH PRIVILEGES;"

	echo ""
    echo "Database and user are succesfully created."
    echo "Existing databases related to \"nevis\" project..."
    mysql -e "SHOW DATABASES LIKE '%nevis%' ;"

    echo ""
    echo ""
    echo "Existing users related to \"nevis\" project..."
    mysql -e "SELECT host, user from mysql.user WHERE user LIKE '%nevis%';"


    echo "Moving forward to perform migrations...";
 
    # For comments see else block
    for i in *.sql; do
        [ -f "$i" ] || break
        echo "Executing $i..."
        if mysql ${dbname} < "$i"  ; then
            echo "Successfully finished executing $i"
        else
            echo -e "${RED}Failed executing $i ${NC}"
        fi
    done


    echo ""
    echo "Existing tables on the database..."
	mysql -uroot -p${rootpasswd} ${dbname} -e "SHOW TABLES ;"

	exit
# If /root/.my.cnf doesn't exist then it'll ask for root password	
else
    echo "We need root previliges to create database and user. Please enter root user MySQL password."
	echo "(password will be hidden while typing)"
	read -s rootpasswd

    echo ""
    echo "Enter database name: (MYSQL_DB_NAME from .env)"
    echo -e "${RED}WARNING: The database will be dropped if it already exists.${NC}"
	read dbname
    mysql -uroot -p${rootpasswd} -e "DROP DATABASE IF EXISTS ${dbname} ;"
	mysql -uroot -p${rootpasswd} -e "CREATE DATABASE ${dbname} ;"

	
    echo ""
	echo "Enter database username: (MYSQL_USERNAME)"
	read username
    echo ""
	echo "Enter database user password: (MYSQL_PASSWORD)"
	read userpass

	mysql -uroot -p${rootpasswd} -e "CREATE USER IF NOT EXISTS ${username}@localhost IDENTIFIED BY '${userpass}' ;"
	mysql -uroot -p${rootpasswd} -e "GRANT ALL PRIVILEGES ON ${dbname}.* TO '${username}'@'localhost' ;"
	mysql -uroot -p${rootpasswd} -e "FLUSH PRIVILEGES;"
	
	echo ""
    echo "Database and user are succesfully created."
    echo "Showing existing databases related to \"nevis\" project..."
	mysql -uroot -p${rootpasswd} -e "SHOW DATABASES LIKE '%nevis%' ;"

    echo ""
    echo ""
    echo "Existing users related to \"nevis\" project..."
    mysql -uroot -p${rootpasswd} -e "SELECT host, user from mysql.user WHERE user LIKE '%nevis%';"


    echo "Moving forward to perform migrations...";
 
    for i in *.sql; do
        [ -f "$i" ] || break
        echo "Executing $i..."
        # ${dbname} is necessary. It is equivalent to `USE ${dbname};` sql command.
        # Below we check whether command is successful or not.
        if mysql -uroot -p${rootpasswd} ${dbname} < "$i"  ; then
            echo "Successfully finished executing $i"
        else
            echo -e "${RED}Failed executing $i ${NC}"
        fi
    done


    echo ""
    echo "Existing tables on the database..."
	mysql -uroot -p${rootpasswd} ${dbname} -e "SHOW TABLES ;"

	exit
fi


