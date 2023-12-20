## MySQL choice
MySQL is good enough. Don't go into the rabbit hole of database any further. No need to over-engineer.
https://stackoverflow.com/a/43987579.
https://stackoverflow.com/a/63981812.
https://stackoverflow.com/questions/1276/how-big-can-a-mysql-database-get-before-performance-starts-to-degrade.

## Referential Actions

https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html.
Cascaded foreign key actions do not activate triggers.
RESTRICT: Rejects the delete or update operation for the parent table.
This action is recognized by the MySQL parser, but both InnoDB and NDB reject table definitions.

## Dropping Foreign Key Constraints

To determine the foreign key constraint name, use SHOW CREATE TABLE:

## Strict Mode

https://dev.mysql.com/doc/refman/8.0/en/blob.html.
https://dev.mysql.com/doc/refman/8.0/en/sql-mode.html#sql-mode-strict.
If strict SQL mode is not enabled and you assign a value to a BLOB or TEXT column that exceeds the column's maximum length, the value is truncated to fit and a warning is generated.

</br>

## charset

https://planetscale.com/blog/mysql-charsets-collations#summary.
A character set can be defined at the column level, the table level, or it can be inherited from the database or server default. The most specific level (column > table > database > server) is used.

Benefits of utf8mb4_unicode_ci over utf8mb4_general_ci: utf8mb4_unicode_ci, which uses the Unicode rules for sorting and comparison, employs a fairly complex algorithm for correct sorting in a wide range of languages and when using a wide range of special characters. (based on https://stackoverflow.com/questions/766809/whats-the-difference-between-utf8-general-ci-and-utf8-unicode-ci). Based on tchrist comment: You should never, ever use utf8_general_ci: it simply doesn’t work.

Also this post is great https://dev.mysql.com/blog-archive/mysql-8-0-1-accent-and-case-sensitive-collations-for-utf8mb4/.

Also take a look at SET NAMES statement. https://dev.mysql.com/doc/refman/8.0/en/set-names.html. Run `select 'a' < 'A' collate utf8mb4_0900_as_cs;`.

If you use COLLATE utf8mb4_bin, then ORDER BY on text fields becomes case-sensitive (i.e. "XYZ" comes before "abc"). (based on [here](https://stackoverflow.com/questions/39463134/how-to-store-emoji-character-in-mysql-database)).

**NOTE:** Even if you create db with `CREATE DATABASE database_name DEFAULT CHARSET = utf8mb4 DEFAULT COLLATE = utf8mb4_unicode_ci;`, Your connection also needs to be utf8mb4 not utf8 for it to work. (based on comment by Henrik Hansen in https://stackoverflow.com/a/50264108)

For emails we use case sensitive.
See comment by Matthew James Briggs in https://stackoverflow.com/questions/9807909/are-email-addresses-case-sensitive.

**Important:** Also you **must** be careful about many other things (not related to db). See this answer by Rich James, https://stackoverflow.com/questions/38363566/trouble-with-utf-8-characters-what-i-see-is-not-what-i-stored/38363567#38363567. For example: HTML forms should start like <form accept-charset="UTF-8">, etc.

## About utfmb4

https://stackoverflow.com/a/60310946.
Also the statement about utf8mb4 taking more bytes is not accurate. Only if your content actually needs multi-byte characters, then those individual characters will take 2, 3, or 4 bytes. More common characters in utf8 still take 1 byte per character. This is the whole point of utf8!

Also from https://planetscale.com/blog/mysql-charsets-collations#character-sets-in-mysql.
According to the UTF-8 spec, each character is allowed four bytes, meaning MySQL's utf8 charset was never actually UTF-8 since it only supported three bytes per character. In MySQL 8, utf8mb4 is the default character set and the one you will use most often. utf8 is left for backwards compatibility and should no longer be used.

## Single quote vs double quote.

See https://stackoverflow.com/questions/11321491/when-to-use-single-quotes-double-quotes-and-backticks-in-mysql.
This suggests that you avoid using " so that your code becomes independent of SQL modes.
using single quotes for string literals is defined (and required) by the SQL standard. Based on user330315 comment.

</br>

## Storing hex data in mysql

https://stackoverflow.com/questions/1712934/storing-hexadecimal-values-as-binary-in-mysql.
We used binary for a ton of different ids in our database to save space, since the majority of our data consisted of these ids. Since it doesn't seem like you need to save space (as it's just passwords, not some other huge scale item), I don't see any reason to use binary here.

MOST IMPORTANT: Unless you are working in an embedded system where each byte counts, don't do it. Having a character representation will allow you better debugging. Plus, every time a developer is working a problem like this I have to wonder why. Every architectural decision like this has trade-offs and this one does not seem like it adds value to your project.

</br>

## Unique column and composite index.
According to https://stackoverflow.com/a/9764392. :
A unique key is a special case of index, acting like a regular index with added checking for uniqueness. Using SHOW INDEXES FROM customer you can see your unique keys are in fact B-tree type indexes. A composite index on (email, user_id) is enough, you don't need a separate index on email only - MySQL can use leftmost parts of a composite index. There may be some border cases where the size of an index can slow down your queries, but you should not worry about them until you actually run into them.
As for testing index usage you **should** first fill your table with some data to make optimizer think it's actually worth to use that index.

</br>

## MEMORY engine

MEMORY tables cannot contain BLOB or TEXT columns.
But they are good for A read-only or read-mostly data access pattern (limited updates).
See Characteristics of MEMORY Tables from https://dev.mysql.com/doc/refman/8.0/en/memory-storage-engine.html.

## Full-text search

https://dev.mysql.com/doc/refman/8.0/en/fulltext-search.html.
Don't alter the MySQL sources unless you know what you are doing.

## TEXT vs Varchar

https://stackoverflow.com/a/25301046.
You need to use TEXT when you want to create a table with two maximum-sized string columns, which means both of them may take 65535 characters. You cannot use two varchars with maximum size in a row at the same time because MySQL has limited the maximum row size, which is 65535. But you can use two TEXT in a row because TEXT only contributes 9 to 12 bytes toward the row size limit, TEXT's contents are stored separately from the rest of the row. – Searene

</br>

## Store birthYear

https://stackoverflow.com/questions/611105/mysql-type-for-storing-a-year-smallint-or-varchar-or-date.
Also [David Aldridge's answer](https://stackoverflow.com/a/617556) in the same post gives a very insightful explanation to _avoid_ using numeric data types for elements _just because_ they are comprised only of digits.

</br>

## Events

The cost of the scheduler is irrelevant, compared to the cost of the SQL the scheduler runs. Based on:
https://stackoverflow.com/questions/37835714/performance-implications-of-mysql-event-scheduling.

</br>

## TIMESTAMP auto-update

Based on https://dev.mysql.com/doc/refman/8.0/en/timestamp-initialization.html , MySQL auto-updates timestamp column when the value of any other column in the row is changed. Even via phpMyAdmin. To prevent this behavior, you **must** also execute these commands.
Based on official docs:
With a DEFAULT clause but no ON UPDATE CURRENT_TIMESTAMP clause, the column has the given default value and is not automatically updated to the current timestamp.
Also see:
https://stackoverflow.com/a/31692163.

Also according to : https://dev.mysql.com/doc/refman/8.0/en/date-and-time-type-syntax.html.
If explicit_defaults_for_timestamp is enabled, there is no automatic assignment of the DEFAULT CURRENT_TIMESTAMP or ON UPDATE CURRENT_TIMESTAMP attributes to any TIMESTAMP column. They must be included explicitly in the column definition. Also, any TIMESTAMP not explicitly declared as NOT NULL permits NULL values.

</br>

## Using INT column with UNIX_TIMESTAMP vs TIMESTAMP
https://stackoverflow.com/questions/7029127/using-mysqls-timestamp-vs-storing-timestamps-directly.
https://stackoverflow.com/questions/29865762/store-date-as-unix-timestamp-or-timestamp-data-type-in-mysql.

## `TIMESTAMP` vs `DATETIME` in MySQL

It's a useful fiction to think of a `TIMESTAMP` as taking the value you are setting and converting it from the current session time zone to UTC for storing and then converting it back to the current session time zone for displaying. According to [OReilly presentation](https://cdn.oreillystatic.com/en/assets/1/event/36/Time%20Zones%20and%20MySQL%20Presentation.pdf), MySQL uses the _timezone system variable_ (i.e. `/etc/localtime`) to convert. When retrieved, converts to current timezone value in the server. It means, if '2009-05-08 17:00:00' is stored when timezone is set to EST, and later the timezone is changed to CST, the value retrieved will be '2009-05-08 16:00:00'. Read [timezone support](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html#time-zone-upgrades) from official docs. Also note, MySQL Server maintains **several** time zone settings. See [timezone variables](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html#time-zone-variables) from official docs.

`TIMESTAMP` can only handle dates 1970 through 2038-01-19, and 2038 problems don't wait for 2038 to happen. Read more in the following links: [stackoverflow link one](https://stackoverflow.com/questions/409286/should-i-use-the-datetime-or-timestamp-data-type-in-mysql), [link two](https://stackoverflow.com/a/56138746).

Finally, The choice between TIMESTAMP or DATETIME is also related to the nature of the event: A video-conference (TIMESTAMP): All attendants should see a reference to an absolute instant of time adjusted to its timezone. But a local task time (DATETIME): I should do this task at 2014/03/31 9:00AM , no matters if that day I'm working in New York or Paris.

</br>

## Time in EVENT

according to https://dev.mysql.com/doc/refman/8.0/en/create-event.html.

</br>

## mysql client commands.

Especially for auto-completion you need `\#`. Also `\!` is useful.
https://dev.mysql.com/doc/refman/8.0/en/mysql-commands.html.

</br>

## Discussion about ENUM

We no longer have `purpose ENUM('signup', 'reset-password')` but the explanation behind giving up ENUM is important.
https://dev.mysql.com/doc/refman/5.7/en/enum.html.
If strict SQL mode is enabled, attempts to insert invalid ENUM values result in an error.
https://stackoverflow.com/a/40551734. about modifying enum. It seems changing the order / removing enums will make those numbers undefined.
Also see https://dba.stackexchange.com/questions/312263/are-enums-still-evil-in-mysql-8-0. Both answers are good.

Side Note: Do not use FK instead of _small set of_ enums. According to the comment by "Dai" in https://stackoverflow.com/a/1434338.
Often enum values are defined in application code first (e.g. C# enum), whereas if they used a table FK reference then those supposedly static enum entries could be modified at runtime which would be undesirable (and SQL Server doesn't support the concept of immutable tables), finally if you have lots of enums with only a few values then you'll end-up adding lots of tables to your database. Not to mention extra IO reads due to FK constraint-checking when inserting/deleting data, whereas a CHECK CONSTRAINT is much faster and doesn't cause database object spam.

</br>

## Storing boolean TINYINT

Accroding to spencer7593 comment in https://stackoverflow.com/a/289767, BIT(1) and TINYINT(1) will both use one byte of storage. The bigger issue is that some client libraries don't recognize or appropriately handle returned BIT datatype columns. A TINYINT works better than BIT.
But BOOLEAN is exactly synonym for TINTINY(1) according to [MySQL docs](https://dev.mysql.com/doc/refman/8.0/en/numeric-type-syntax.html). quoting: However, the values TRUE and FALSE are merely aliases for 1 and 0, respectively, so SELECT IF(2 = TRUE, 'true', 'false'); will give false.

According to [here](https://github.com/sidorares/node-mysql2/issues/81), it seems boolean typecase is not supported by node-mysql driver by default. Although you can write your own typecast as described in that issue (https://github.com/sidorares/node-mysql2/issues/81#issuecomment-1057621826).

</br>

## UUID

Do not use varchar(). See vstoyanov comment below https://stackoverflow.com/a/43056611.
According to https://stackoverflow.com/a/54759433, Most efficient is definitely BINARY(16), storing the human-readable characters uses over double the storage space, and means bigger indices and slower lookup. If you only need the column pretty when reading the database, there is statement supplied in the same answer. Also note the UUID() function returns a UUID value in compliance with UUID **version 1** described in the RFC 4122.

But according MySQL docs itself, Although UUID() values are intended to be unique, they are not necessarily unguessable or unpredictable. If unpredictability is required, UUID values should be generated some other way.
Also...
According to Mike McCoy comment in https://stackoverflow.com/questions/11026061/is-uuid-randomuuid-suitable-for-use-as-a-one-time-password, Actually, the [RFC explicitly cautions](https://datatracker.ietf.org/doc/html/rfc4122#section-6) against using UUIDs as security tokens: "Do not assume that UUIDs are hard to guess; they should not be used as security capabilities (identifiers whose mere possession grants access), for example." A UUID4 generated with a secure RNG will be nearly impossible to guess, but the standard explicitly allows insecure RNGs(!). tools.ietf.org/html/rfc4122#section-6 (Apologies for resurrecting a very old comment, but security is everyone's concern.) –

Also according to Rich James in https://stackoverflow.com/a/39714657, UUIDs, at the scale you are talking about, will not just slow down the system, but actually kill it.

</br>

## Base64 charset

According to thomasrutter comment in https://stackoverflow.com/a/3455478, for columns which are an ASCII-limited code only rather than real words (eg hashes, base64, standard country codes, etc), it may be a good idea to use the ascii_bin collation. If you use a utf-8 based collation it will reserve 3 or 4 bytes per character for CHAR columns instead of only 1.

Also see https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem.

</br>

## AUTO_INCREMENT limit

https://stackoverflow.com/questions/11264447/what-is-the-limit-of-auto-increment-integer-in-mysql.
The limit of an auto_increment column is the size of the column. For unsigned int it is 4294967295.
Also https://stackoverflow.com/questions/46365450/what-to-do-if-the-auto-increment-value-reaches-its-limit.

## AUTO_INCREMENT Handling in InnoDb

See https://dev.mysql.com/doc/refman/8.0/en/innodb-auto-increment-handling.html. `innodb_autoinc_lock_mode` variable.

</br>

## Delete in MySQL

According to https://mysql.rjweb.org/doc.php/deletebig, To be ready for a crash, a transactional engine such as InnoDB will record what it is doing to a log file. To make that somewhat less costly, the log file is sequentially written. If the log files you have (there are usually 2) fill up because the delete is really big, then the undo information spills into the actual data blocks, leading to even more I/O.

The same person in https://stackoverflow.com/a/49703493: In InnoDB, a DELETE of any size is transactional. Deleting a million will be slow, mostly because of the need to prepare for a possible ROLLBACK.

Also according to [official docs](https://dev.mysql.com/doc/refman/8.0/en/delete.html) below "InnoDB Tables" section, there is a trick which uses RENAME and doesn't use DELETE at all.

</br>

## pagination

According to https://mysql.rjweb.org/doc.php/pagination (Very detailed article even talking about \<a\> tags to use for frontend):
For this discussion, I am assuming

-   The datetime field might have duplicates -- this can cause troubles
-   The id field is unique
-   The id field is close enough to datetime-ordered to be used instead of datetime.

Very efficient -- it does all the work in INDEX(topic, id):
WHERE topic = 'xyz'
AND id >= 876
ORDER BY id ASC
LIMIT 10,41.

Note how all the = parts of the WHERE come first; then comes both the >= and ORDER BY, both on id. This means that the INDEX can be used for all the WHERE, plus the ORDER BY.

</br>

## backticks vs brackets

I would strongly recommend to avoid any object name that requires quoting. Using identifiers that do not require quoting will save you a lot of trouble in the long run. According to https://stackoverflow.com/questions/9719869/what-is-the-difference-between-the-backtick-and-the-square-bracket-in-sql-statem.

</br>

## multiple ports

According to https://stackoverflow.com/questions/790242/how-to-add-a-port-to-mysql-server, You cannot bind mysqld to listen to multiple ports. The only way you can achieve this is with internal routing rules which would forward the target port to 3306. If you are on linux, you can achieve this using iptables.
Although not very much related, but important to know: https://stackoverflow.com/questions/25905657/its-mysql-or-mysqld. mysqld is the MySQL server. https://dev.mysql.com/doc/refman/8.0/en/mysqld-server.html and https://dev.mysql.com/doc/refman/8.0/en/mysqld.html.


## Maybe NoSQL (Mongo)?
This answer gives a very good practical example of when MongoDb works faster and why: https://stackoverflow.com/a/9703513. Also talks about optimisation by denormalisation in the comment.
Also this comment https://www.reddit.com/r/Database/comments/cx4r8r/comment/eyj8j25/.