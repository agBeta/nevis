## Based on docker

start with persistent storage

`docker run --name some-redis -d redis redis-server --save 60 1 --loglevel warning`

There are several different persistence strategies to choose from. This one will save a snapshot of the DB every 60 seconds if at least 1 write operation was performed (it will also lead to more logs, so the loglevel option may be desirable). If persistence is enabled, data is stored in the VOLUME /data, which can be used with --volumes-from some-volume-container or -v /docker/host/dir:/data (see docs.docker volumes).
For more about Redis Persistence, see http://redis.io/topics/persistence.

You can create your own Dockerfile that adds a redis.conf from the context into /data/, like so.

```
FROM redis
COPY redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
```

## Based on redis docs

Persistence in Docker

To mount directories or files to your Docker container, specify -v to configure a local volume. This command stores all data in the local directory local-data:

`docker run -v /local-data/:/data redis/redis-stack:latest`

To start a Redis Stack container using the redis-stack image, run the following command in your terminal:

`docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest`

The docker run command above also exposes RedisInsight on port 8001. You can use RedisInsight by pointing your browser to localhost:8001.

for production: use `redis/redis-stack-server:latest` instead. and remove 8001 port.

## Basic command

```
KEYS *              --> never use in production, blocks redis and all other queries
SET powerlevel 9001
GET powerlevel      --> returns "9001" (with quotation)
set firstname "John" EX 10
get firstname
append firstname " Snowden"

EXISTS powerlevel   --> integer 0 or 1
SETEX name 10 kyle  --> expire after 10 seconds
EXPIRE powerlevel 10 
TTL powerlevel      --> show like 9, 8, ..., -1, ...

subscribe newvideos
publish newvideos "Crash course is ready"
```

---

```
SET "user:userId" "some id"

KEYS user:*     --> bad practice

SET "user:123"  '{"email":"ab@gmail.com","pass":"foo"}'


HMSET user:123 email "ab@gmail.com"
               pass "12cb34"

HGETALL user:123


HSET user:123 name "Tom"
HGET user:123 name   -->  returns "Tom"
HDEL user:123 name

```

## sorted sets

```
ZADD userlogins 10 user123
ZCORE userlogins user123    --> returns "10"
ZINCRBY userlogins 7 foo    --> create new member foo (since it doesn't exist) and sets score to 0+7=7.

ZREVRANGE userlogins 0 -1   --> lists of ALL (meaning of 0 to -1) keys (but not scores) descending order of score.
```

to get top 3 logged in users: `ZREVRANGE userlogins 0 2`

to get number of members within our set: `ZCARD userlogins`

to get users with login count greater than 10 in ascending order:  
`ZRANGEBYSCORE userlogins 10 +inf`

to get users with login count less than 5 with scores:  
`ZRANGEBYSCORE userlogins -inf 5 WITHSCORES`

## transaction
From [redis docs](https://redis.io/docs/interact/transactions/):  
  
All the commands in a transaction are serialized and executed sequentially. A request sent by another client will never be served in the middle of the **execution** of a Redis Transaction. This guarantees that the commands are executed as a single isolated operation.

The EXEC command triggers the execution of all the commands in the transaction, so if a client loses the connection to the server in the context of a transaction before calling the EXEC command none of the operations are performed, instead if the EXEC command is called, all the operations are performed. When using the append-only file Redis makes sure to use a single write(2) syscall to write the transaction on disk. However if the Redis server crashes or is killed by the system administrator in some hard way it is possible that only a partial number of operations are registered. Redis will detect this condition at restart, and will exit with an error. Using the redis-check-aof tool it is possible to fix the append only file that will remove the partial transaction so that the server can start again.

```
WATCH user_email:goku@me.com  
MULTI       --> enter transaction
SET ...
EXEC
```


## Kyle  
```
LPUSH friends john
LRANGE friends 0 -1
LPUSH friends sally
LRANGE friends 0 -1   ---> "sally", "john"
RPUSH friends mike
LPOP friends
RPOP friends
```




## Time complexity
LPUSH time complexity O(1) for each element added, based on https://redis.io/commands/lpush/.
RPUSH is O(1).
  
RPOP  is O(N) where N is the number of elements returned.  
LPOP is also O(N). Removes and returns the first elements of the list stored at key. N is the number of elements returned. @fast.

HGET O(1).
SADD O(1) for each element added.


## redis nodejs
https://github.com/redis/node-redis?tab=readme-ov-file#disconnecting
.QUIT()/.quit()
Gracefully close a client's connection to Redis, by sending the QUIT command to the server. Before quitting, the client executes any remaining commands in its queue, and will receive replies from Redis for each of them.



https://github.com/redis/node-redis/blob/master/docs/isolated-execution.md.

redisClient.setex("photo:123", 3600 /*1 hour*/, JSON.stringify(data));

</br>
## Redis when key expires
https://stackoverflow.com/questions/11810020/how-to-handle-session-expire-basing-redis/11815594#11815594.
https://stackoverflow.com/questions/59729331/is-there-a-anyway-to-make-redis-key-value-decrease-by-1-over-time.