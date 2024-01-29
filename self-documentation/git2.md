## restore vs checkout

According to [this SO thread](https://stackoverflow.com/questions/61130412/what-is-the-difference-between-git-checkout-vs-git-restore-for-reverting-un):
[`git restore`](https://git-scm.com/docs/git-restore) is a command introduced in Git 2.23 (August 2019) together with [`git switch`](https://git-scm.com/docs/git-switch). Their purposes are to simplify and separate the use cases of [`git checkout`](https://git-scm.com/docs/git-checkout) that does too many things.

`git checkout` can be used to switch branches (and also to create a new branch before switching to it). This functionality has been extracted into `git switch`.

`git checkout` can also be used to restore files to the state they were on a specified commit. This functionality has been extracted into `git restore`.

They can still be performed by `git checkout` but the new commands are easier to use and less confusing.

To summarize:
`git restore readme.txt` is a new way to do what you *used to do* with: `git checkout -- readme.txt`

</br>

Torek's answer:
I like the two answers on this at the time I write mine—both [axiac's answer](https://stackoverflow.com/a/61130521/1256452) and [kapsiR's](https://stackoverflow.com/a/61130495/1256452), but the way I would put it is this:

- `git checkout` combines too many commands into one front end. Some of these commands are "safe", in that if you have uncommitted work, they _won't_ destroy it, and some of these are "unsafe", in that if you have uncommitted work and tell them _destroy my uncommitted work_, they will do that.
- `git switch` implements the "safe" subset.
- `git restore` implements the "unsafe" subset.

`git checkout _name_` may execute _either_ the _unsafe_ one or the _safe_ one, depending on something you might not even be thinking about!

Now, this last bullet point is fixed in the latest Git versions. Suppose you have a remote-tracking `origin/dev` name and you'd like to create branch `dev` accordingly. Normally, you could just run: `git checkout dev`
Suppose, though, that your current (probably `master`) checkout has a _directory_ named `dev`, and in that directory, you've done a bunch of work and have not yet committed it.  ... My hard work is all gone!
A more modern Git (2.24.0) will tell me that `git checkout dev` is ambiguous.  
Anyway, using the _new_ commands, you at least know, right as you type in the command, whether you will get the safe mode or the unsafe one


### useful restore
```bash
git restore -p --source=<commit-ish>
```

