## redis in docker

(Based on redis page on docker website)
start with persistent storage

`docker run --name some-redis -d redis redis-server --save 60 1 --loglevel warning`

There are several different persistence strategies to choose from. This one will save a snapshot of the DB every 60 seconds if at least 1 write operation was performed (it will also lead to more logs, so the loglevel option may be desirable). If persistence is enabled, data is stored in the VOLUME /data, which can be used with --volumes-from some-volume-container or `-v /docker/host/dir:/data` (see docs.docker volumes).
For more about Redis Persistence, see http://redis.io/topics/persistence.

You can create your own Dockerfile that adds a redis.conf from the context into /data/, like so.

```
FROM redis
COPY redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
```


### Based on redis docs

Persistence in Docker

To mount directories or files to your Docker container, specify -v to configure a local volume. This command stores all data in the local directory local-data:

`docker run -v /local-data/:/data redis/redis-stack:latest`

To start a Redis Stack container using the redis-stack image, run the following command in your terminal:

```bash
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

The docker run command above also exposes RedisInsight on port 8001. You can use RedisInsight by pointing your browser to localhost:8001.

for production: use `redis/redis-stack-server:latest` instead. and remove 8001 port.


----
## Basic commands

```bash
KEYS *  
SET powerlevel 9001
GET powerlevel          # returns "9001" (with quotation)
set firstname "John" EX 10
get firstname
append firstname " Snowden"

EXISTS powerlevel       # integer 0 or 1
SETEX name 10 kyle      # expire after 10 seconds
EXPIRE powerlevel 10 
TTL powerlevel          # shows sth like 9, 8, ..., -1, ...
```
**Notes**:
- Never use `KEYS *` in production. According to [redis docs](https://redis.io/commands/keys/), consider `KEYS` as a command that should only be used in production environments with extreme care. It may ruin performance when it is executed against large databases. This command is intended for debugging and special operations, such as changing your keyspace layout. Don't use `KEYS` in your regular application code. Use: `SCAN <cursor> MATCH <pattern>`

#### read commands from file
```bash
docker exec -i redis-stack-server redis-cli < Command.txt
```


### Namespaces
```bash
SET user:1:username matin
SET user:2:username moein
SET user:3:username youness
```
Now, you can run: `keys user:*:username`
Or better: `SCAN 0 MATCH user:*:username`


----
### Keyspace
Based on [redis keyspace docs](https://redis.io/docs/manual/keyspace/): Redis keys are binary safe; this means that you can use any binary sequence as a key, from a string like "foo" to the content of a JPEG file. The empty string is also a valid key.
A few other rules about keys:

- Very long keys are **not a good idea**. For instance a key of 1024 bytes is a bad idea not only memory-wise, but also because the lookup of the key in the dataset may require several costly key-comparisons. Even when the task at hand is to match the existence of a large value, hashing it (for example with SHA1) is a better idea, especially from the perspective of memory and bandwidth.

- Very short keys are often **not a good idea**. There is little point in writing "u1000flw" as a key if you can instead write "user:1000:followers". The latter is more readable and the added space is minor compared to the space used by the key object itself and the value object. While short keys will obviously consume a bit less memory, your job is to find the right balance.

#### Key expiration 
 Information about expires are replicated and **persisted** on disk, the time virtually passes when your Redis server remains stopped (this means that Redis saves the date at which a key will expire).

**Note about keyspace notifications**: Redis Pub/Sub is _fire and forget_ that is, if your Pub/Sub client disconnects, and reconnects later, all the events delivered during the time the client was disconnected are lost.


---
## Hash
```bash
HSET Car Brand "Ford" Model "Dark Horse Premium" Price "$63265"

HGETALL Car
1) "Brand"
2) "Ford"
3) "Model"
4) "Dark Horse Premium"
5) "Price"
6) "$63265"

HGET Car Brand
"Ford"
```

Another example:
```bash
HSET user:1 username Moein
HSET user:1 email Moein@example.com
HSET user:1 age 22

HMGET user:1 username email age

HDEL user:1 age  
```

**NOTE**: According to [this SO answer](https://stackoverflow.com/questions/29203717/redis-storing-list-inside-hash): Redis' data structures cannot be nested inside other data structures, so storing a List inside a Hash is **not possible**.


**NOTE**: Redis official docs has code examples for Node.js client. For instance, take a loot at [redis hash](https://redis.io/docs/data-types/hashes/):
```js
import { createClient } from 'redis';

const client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

const fieldsAdded = await client.hSet(
    'bike:1',
    {
        model: 'Deimos',
        brand: 'Ergonom',
        type: 'Enduro bikes',
        price: 4972,
    },
)
console.log(`Number of fields were added: ${fieldsAdded}`);
// Number of fields were added: 4

const model = await client.hGet('bike:1', 'model');
console.log(`Model: ${model}`);
// Model: Deimos

const price = await client.hGet('bike:1', 'price');
console.log(`Price: ${price}`);
// Price: 4972

const bike = await client.hGetAll('bike:1');
console.log(bike);
// {
//   model: 'Deimos',
//   brand: 'Ergonom',
//   type: 'Enduro bikes',
//   price: '4972'
// }

const fields = await client.hmGet('bike:1', ['model', 'price']);
console.log(fields); // [ 'Deimos', '4972' ]

let newPrice = await client.hIncrBy('bike:1', 'price', 100);
console.log(newPrice); // 5072
newPrice = await client.hIncrBy('bike:1', 'price', -100);
console.log(newPrice); // 4972

let rides = await client.hIncrBy('bike:1:stats', 'rides', 1);
console.log(rides); // 1

rides = await client.hIncrBy('bike:1:stats', 'rides', 1);
console.log(rides); // 2

rides = await client.hIncrBy('bike:1:stats', 'rides', 1);
console.log(rides); // 3

let crashes = await client.hIncrBy('bike:1:stats', 'crashes', 1);
console.log(crashes); // 1

let owners = await client.hIncrBy('bike:1:stats', 'owners', 1);
console.log(owners); // 1

rides = await client.hGet('bike:1:stats', 'rides');
console.log(`Total rides: ${rides}`); // Total rides: 3

const stats = await client.hmGet('bike:1:stats', ['crashes', 'owners']);
console.log(`Bike stats: crashes=${stats[0]}, owners=${stats[1]}`); // Bike stats: crashes=1, owners=1

await client.quit();
```


----
## Sorted sets
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
```bash
LPUSH friends john
LRANGE friends 0 -1
LPUSH friends sally
LRANGE friends 0 -1   # "sally", "john"
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