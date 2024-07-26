# Architecture

### why express-callback
To have a fairly independent code from a third-party framework like Express.

### why naming the folder data-access instead of database
More conciousness. Better name. database is sql but repositories is a driver.

### Why randomBytes over UUID for sessionId?
According to https://nodejs.org/api/crypto.html#cryptorandombytessize-callback, Generates cryptographically strong pseudorandom data.
See Also database.md uuid.


### Why Joi inside controller?
Want to see validation next to code. Less jump around and search fatigue. No overdoing of clean-architecture.
validation near eye.

</br>

## Clean Architecture (& similar)

Comments in [youtube]
https://www.youtube.com/watch?v=SxJPQ5qXisw
TheDraiken, 5 months ago
Having worked with this in large codebases I can say with confidence: it's nice in theory but awful in practice.
The devil is in the details and people will abuse "interactors" in every possible way. Soon you'll have one interactor calling 5 other interactors which in turn call other interactors and in the end all you have is a procedural nightmare.

Unless you're strict about everything under this architecture, it will surely make your code unnecessarily complex with very little benefit. Be very careful with this. 

----
*(thigmotrope 1 year ago)*  
I can't imagine trying to explain all these abstractions to junior devs and maintaining any kind of long term fidelity to it.   No doubt it would become an unmitigated mess.   And senior devs would just argue about it.   Of course not doing this results in an unmitigated mess as well so I don't know.  I guess I'd prefer my messes with fewer abstractions.


based on [this reddit](https://www.reddit.com/r/androiddev/comments/9o1w35/downsides_of_clean_architecture/):  

Most of the time we deal with data consumption, there is no complex business logic in there. It means you have many read models with few write models and many logics that we put on use cases are simple as a query on a repository. I mean you have a bunch of CRUD operations with some filtering in them and choosing between different data sources. So if you want to put every CRUD operation into a single use case, you will have many use cases.

----  
*(comment from AleksanderFimreite  below [another youtube video](https://www.youtube.com/watch?v=rQlMtztiAoA))*

In my experience. The fun thing about programming, is that it does not matter how much you are aware of, Or how many suggestions you have gotten. You will still end up making regretable mistakes reguardless. 
... I struggle more with accepting that my code is good enough and **actually finish the project** when I know I could improve it.


### Some other useful links

- [.NET abstraction fetish (on reddit)](https://www.reddit.com/r/dotnet/comments/1e7u67a/do_we_have_an_abstraction_fetish_in_net/) -> Just as an evidence (from more experienced developer) that over-engineered code has downsides.  
- [Primeagen about Clean Code](https://www.youtube.com/watch?v=IqHaGd9J42s) which has some (good) insights/points from an experienced developer who has worked on large applications on Netflix.
- [It's probably time to stop recommending Clean Code](https://qntm.org/clean). (BTW, there's also a good [article about/against(?) Testing and TDD](https://qntm.org/tests) from this author).


## More

These pieces are from [Jamie Brandon's blog](https://www.scattered-thoughts.net/).

Much of my progress since then has been unlearning all those things. In hindsight, most of the writing and discussion I read online about how to program was actively harmful to my ability to successfully produce working code.  
That's not to say that most programmers are bad programmers. Just that it's **not automatically the case** that good programmers will produce good advice, or that good advice will be more widely shared than bad advice.  

**Details matter**  
Trying to apply the rule of thumb without knowing all those details tends to result in failure. Phrases like "don't repeat yourself", "you aren't going to need it", "separation of concerns", "test-driven development" etc were originally produced from some body of valid experience, but then wildly over-generalized and over-applied without any of the original nuance.  

**Confusing means and ends**  
The goal is always to write a program that solves some problem and that can be maintained over its useful lifetime.  
Advice like "write short functions" is a technique that may help achieve that goal in many situations, but it's not a goal in itself. And yet some characteristic of human thinking makes it very easy for these sort of pseudo-goals to take over from the actual goals. So you may hear people saying that some piece of software is *bad* because it has very long functions, even if the evidence suggests that it also happens to be easy to maintain.  
When means and ends are confused, it's also often accompanied by the word "should" and other similar phrases that carry some moral or hygienic weight (eg "the right way to do it", "clean code" vs "code smells"). This strips away any consideration of the context or goals of a specific project.

For example, on the subject of how to organize code into functions, contrast Martin Fowler:   
... Any function more than half-a-dozen lines of code starts to smell to me...  
Vs John Carmack:  
... If a function is only called from a single place, *consider* inlining it...


----
*(from [things unlearned](https://www.scattered-thoughts.net/writing/things-unlearned/))*   

I want to focus especially on ideas that I wasted a lot of time on, or that got in the way of success.

~~**Everyone is doing it wrong**~~

It's easy to find examples of this idea, that everyone is doing computers completely wrong and that there exist simple solutions (and often that everyone else is just too lazy/stupid/greedy/immoral to adopt them).

X is amazing, so why isn't everyone using it? They must be too lazy to learn new things. Y is such a mess, why didn't they just build something simple and elegant instead.  

It's so easy to think that simple solutions exist. But if you look at the history of ideas that actually worked, they tend to only be simple from a distance. The closer you get, the more you notice that the working idea is surrounding by a huge number of almost identical ideas that don't work.  
Take bicycles, for example. They seem simple and obvious, but it took two centuries to figure out all the details and most people today [can't actually locate the working idea](https://link.springer.com/content/pdf/10.3758/BF03195929.pdf) amongst its neighbours.  

~~**Programming should be easy**~~

A similar trap hit often got me on a smaller scale. Whenever I ran up against something that was ugly or difficult, I would start looking for a simpler solution.  
For example when I tried to make a note-taking app for tablets many years ago I had to make the gui, but gui tools are always kind of gross so I kept switching to new languages and libraries to try to get away from it. In each successive version I made less and less progress towards actually building the thing and had to cover more and more unknown ground. I wasted many hours and never got to take notes on my tablet.  

If you have a mountain of shit to move, how much time should you spend looking for a bigger shovel? There's no obviously correct answer - it must depend on the size of the mountain, the availability of large shovels, how quickly you have to move it etc. But the answer absolutely **cannot be 100% of your time**. At some point **you have to** shovel some shit.