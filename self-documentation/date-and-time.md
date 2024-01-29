## `TIMESTAMP` vs `DATETIME` in MySQL

See database.md.

</br>

## Timezone in nodejs config vs client-side javascript

Be careful about `timezone` value in nodejs mysql driver configurations. Your production server might be anywhere on earth. It is recommended to make it dynamic based on month value of `toLocaleDateString('fa')`. Inconsistency of `timezoneOffset` between database and client-side javascript leads to some bugs. Browsers automatically take daylight saving time into account (i.e. if you run `new Date().getTimezoneOffset()` inside a browser, it will display -270 in spring/summer, and it will display -210 in autumn/winter for Iranian clients).   

You might be able to reproduce some bugs following these steps: 
- Connect to your MySQL database via nodejs driver and insert a record which has a `TIMESTAMP` field and its value is `ADDTIME(NOW(), '00:01:00')` which means one minute later.  
- Run client side application and try to fetch this newly inserted resource from the server and see what happens.  

As a summary: If timezone of database connection is inconsistent with browser, times will be displayed incorrectly inside client-side application (i.e. A post that is *really* sent two hours ago, will be displayed to the users as if it was sent one/three(?) hours ago).  

According to [mysqljs docs](https://github.com/mysqljs/mysql#connection-options), `timezone` value in connection pool configuarion is the **session timezone**. Based on [MySQL official docs](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html), session timezone setting affects display and storage of time values that are zone-sensitive. This includes the values displayed by functions such as `NOW()` or `CURTIME()`, and values stored in and retrieved from `TIMESTAMP` columns. You can set session timezone by running `SET time_zone = '+02:30';` (based on [here](https://stackoverflow.com/a/602038) and [here](https://stackoverflow.com/a/409305)).  

BTW, since we are now deep into this topic, it is worth knowing that there is a `dateStrings` option. See [mysqljs docs](https://github.com/mysqljs/mysql#connection-options).



## Don't use 
**Don't** use new Date().toISOString().slice(0, 19).replace('T', ' ') to insert into MySQL. According to Mr Coder comment in https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime, It will throw away the timezone which is crucial piece of information.

## Test Timezone
See test.md file.