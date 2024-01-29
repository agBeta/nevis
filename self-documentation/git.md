## Bare Clone

If you want to bare clone the repo, you should follow these steps:
1. The last argument below is the name of destination folder you want to clone:
&emsp; `git clone --bare https://github.com/agBeta/sample-pwa.git sample-pwa`

2. According to [git documentation](https://git-scm.com/docs/git-clone#Documentation/git-clone.txt---bare) and [this blog](https://morgan.cugerone.com/blog/workarounds-to-git-worktree-using-bare-repository-and-cannot-fetch-remote-branches/), when using git clone with the --bare option, neither remote-tracking branches nor the related configuration variables are created. So git fetch and similar commands will not work by default and we have to to run:  
&emsp; `git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"`

3. Then **inside** your desired worktree directory run: `git fetch`

4. In the root directory (parent of all worktree directories), you can now run any of the following commands to gain information. Instead of `main` you can write your desired branch.  
&emsp; `cat worktrees/main/FETCH_HEAD`  
&emsp; `cat refs/heads/main`  
Read more about all different HEADs [here](https://stackoverflow.com/questions/17595524/orig-head-fetch-head-merge-head-etc).

5. If you want to see the difference between your remote and local repository in any branch, then **inside** your desired worktree (e.g. `main`) directory run `git log origin/main..main`. Note, order is important. For more information read [this stackoverflow answer](https://stackoverflow.com/questions/7057950/commit-differences-between-local-and-remote).

6. If you want to check your are indeed inside a worktree: `git rev-parse --is-inside-work-tree` should return true. Notice `git rev-parse --is-inside-git-dir` should return false.

</br>

### Undo all uncomitted changes

The safest way (without removing ignored files, like `.env` or `node_modules`) is the following. This is based on [this stackoverflow answer](https://stackoverflow.com/questions/14075581/git-undo-all-uncommitted-or-unsaved-changes).
&emsp; `git add . && git stash && git stash drop`

</br>

## `.gitattributes`

We use .gitattributes to solve `LF vs CRLF` problem and normalize our repository (based on [git docs](https://git-scm.com/docs/gitattributes#_text)). [This blog] (https://www.aleksandrhovhannisyan.com/blog/crlf-vs-lf-normalizing-line-endings-in-git/) gives a very detailed explanation about `CRLF` and `LF`. **Note**, If you have files added to Git index _prior_ to .gitattribute addition, you must run: `git add --renormalize .`

</br>

----
##  Branch

#### New branch
Use `tree .git/refs`  to see all refs (including branches and tags).  
Run `git branch new_branch_name` to create a branch *without* checking out the branch (so this differs from `git checkout -b new_branch_name`).
Now if you run `tree .git/refs`, you could see the new branch.   

**NOTE**: Always make sure, HEAD is on the correct place before you create the new branch. For example, if you are currently on branchA and you're going to create branchB, you should probably checkout main and then create branchB.

The following is mostly useful when you have just commited (one or many commits) in a detached head state: `git branch new_branch_name commit_sha1`. This way your work will be saved, as there is a permamnent reference to it.  
If you don't point a new branch at those commits, they will no longer be referenced in git (dangling commits). Eventually, they're gonna be garbage collected.

#### naming convention
Use slash. it's better than underline. Now, you can use something like:
`git branch --list "web-design/*"`

</br>

### New Branch and Worktree

If you use git worktree, simply run `git worktree add <path>`. According to [git docs](https://git-scm.com/docs/git-worktree#_description), it automatically creates a **new** branch whose name is the final component of `<path>`. To instead, work on an **existing** branch in a new worktree, use `git worktree add <path> <branch>`. Also you can specify `-d` flag to create a **throwaway** worktree not associated with any branch.

If you want to delete a branch, you must first remove its worktree.


### remote branch
To list remote branches:
```bash
git branch -r
```
To checkout a remote branch as a local branch:
```bash
git checkout -b local_branch_name origin/remote_branch_name
```

</br>


---
##  gitignore 
#### based on file size
Based on [this SO answer](https://stackoverflow.com/questions/4035779/gitignore-by-file-size):
`find . -size +100M | cat >> .gitignore`

#### more on patterns
Using `!` excludes from gitignore.  
If you omit `/` from the beggining, the file will be ignored from all places.
Read more on [atlassian tutorial](https://www.atlassian.com/git/tutorials/saving-changes/gitignore#git-ignore-patterns).

</br>

---
## Better Log

If you want to see git logs for a file in the last hour, it is recommended to use some other flags to also include history of file before it was renamed. We assume you **always** rename or move your repository files using `git mv` (otherwise, the following command will **not** show the actual history). You can run:  
 `git log --since="1 hour ago" --name-status --follow -- <path to file>`  
If you do not specify last two flags, the result will end on the commit in which the file was renamed/moved.

If you want to see git logs containing a specific word: `git log --grep="entities"`. This is better than piping git log into `grep`. The latter doesn't show commit hash and other information.

</br>

Chances are that, you have renamed a file in some commit, but you do not remember its current name. You can use `--diff-filter` flag so that the result selectively includes (or exludes) files that have been renamed or deleted. For rename you can run: `git log --diff-filter=R`.

</br>

If you want the first line of last 5 commits to be shown inside the terminal without their hash, you can run `git --no-pager log -5 --oneline --pretty=format:%s`. See [git docs](https://git-scm.com/docs/pretty-formats) for documentation.  

</br>

#### `--invert-grep`

Based on [atomic pushes, push to deploy](https://github.blog/2015-04-30-git-2-4-atomic-pushes-push-to-deploy-and-more/):
There is a new option, `--invert-grep`, that inverts the sense of the other pattern-matching options. When this option is used, `git log` lists the commits that _don’t_ match the specified pattern(s). For example, to search for merge commits that do not include a “Fixes” annotation in their commit messages, you could run:
`git log --all --merges --invert-grep --grep=Fixes`

###### Advanced usage
It is not possible to combine pattern-matching options into arbitrary expressions like “match A and B but not C” in a single `git log` command. But now, thanks to `--invert-grep`, you can do so by stringing commands together in pipelines, though it is a bit subtle. For example, suppose you want to find the non-merge commits in Git’s `master` branch that were written by its maintainer, Junio Hamano, but are missing “Signed-off-by” lines:

```ShellSession
$ git rev-list --no-merges --author="Junio C Hamano" master |
      git log --stdin --no-walk --invert-grep --grep='^Signed-off-by:'
```

Note that the first command uses `git rev-list`, which just lists the SHA-1s of matching commits rather than showing their commit messages etc. `git rev-list` takes many of the same options as `git log`. Its output is used as the input to a second command, which uses `--stdin --no-walk` to read commit SHA-1s from its standard input and only process those commits. (Without `--no-walk`, the second command would also process the ancestors of the commits passed to it.) The second command thus skips any commits that contain “Signed-off-by” lines, and outputs the rest.

It turns out that many of the commits listed by the previous command are “revert” commits, which don’t really need `Signed-off-by` lines, so let’s exclude revert commits and count how many are left:

```ShellSession
$ git rev-list --no-merges --author="Junio C Hamano" master |
      git rev-list --stdin --no-walk --invert-grep --grep='^Signed-off-by:' |
      git rev-list --stdin --no-walk --invert-grep --grep='^Revert ' |
      wc -l
76
```

As you can see, it is possible to put together quite sophisticated queries using these building blocks.

</br>

#### logs after a specific version
`git log --oneline --graph v2.3.0..v2.4.0`

#### other logs
`git log --before="2021-01-02"`

If you simply want to see commits only related to a file/directory, you can run: `git log -- main.py`

Also for `-S` flag, see *Searching* a few lines after.

Another example:
```bash
git log -n 2 --after="10 hours ago" --author="John" -S"def" -- calculator.py
```

</br>


----
## Other useful `show` & `diff` commands

You can run `git show <commit>:<file>`. If the file does not exist in the commit it will display an error. For example, if you want to know contents of package.json in two commits ago (following the 1st parent of `HEAD`), you can run: `git show HEAD~2:package.json`

</br>

If you only want to know which files changed in the latest commit, run `git show HEAD~1 --stat` . The result will show the commit message, along with name of the files that were changed and how many insertions/deletion/etc were made. If you omit `--stat` flag, it will dislay commit and its textual diff.

</br>

#### diff

If you want to know unstaged changes (i.e. what *could* be in the next commit), run  `git diff` . If you want to know staged changes (i.e. already `git add`ed and *will* be in the next commit) use `--staged` flag at the end.

Another useful diff:
```bash
git diff <COMMIT1> <COMMIT2>
```

</br>


---
####  Creating a Branch from a Stash
According to [git book: stashing and cleaning](https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning):
```bash
git stash branch testchanges
```

#### Searching
According to [git book](https://git-scm.com/book/en/v2/Git-Tools-Searching):
If, for example, we want to find out when the ZLIB_BUF_MAX constant was originally introduced, we can use the -S option (colloquially referred to as the Git “pickaxe” option) to tell Git to show us only those commits that changed the number of occurrences of that string.
`git log -S ZLIB_BUF_MAX --oneline`

Some more useful links:
- https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified.
- https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging.

#### interactive staging
Based on [git book Interactive staging](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging):
`git add -i`  -->  `u`  --> `2,3` --> presee `enter` again.
You can also do Staging Patches (identical to `git add -p`) with letter `p`.

</br>

---
## Undo commits
Follow these step:  
1. In order to have a rescure plan in case of any disastrous action, you may want to save (also see Note 1 below) the hash of current HEAD (Although `ORIG_HEAD` helps us, but we may jump around a lot). So run `git rev-parse --verify HEAD`. So now, the hash is saved in our bash history and we can `checkout` or `reset` or `branch happy <hash>` to this commit hash in case of disaster (it won't be garbage collected any time soon, accoding to [git docs](https://git-scm.com/docs/git-gc#Documentation/git-gc.txt-gcreflogExpireUnreachable)).  
Note 1: You don't have to save the hash of current HEAD in bash history, because `git reflog show` will display old values of a reference.  
Note 2: If you want to undo only **the last commit** then stashing is a better rescue alternative (run `git stash save --include-untracked "WIP: save changes in case of disaster"`).  

2. Then `git reset --mixed HEAD~2`. Your working area is still untouched, at the moment. But if you instead use `--hard` flag, your working area will be overwritten.


</br>

## commit hash of remote
`git branch -r` causes the remote-tracking branches to be listed, and option -a shows both local and remote branches.
`git rev-parse $(git branch -r --sort=committerdate | tail -1) `

</br>

## git rev-parse
A satisfying way to think of it, according to [this SO answer](https://stackoverflow.com/a/28249368):  

Just to elaborate on the etymology of the command name `rev-parse`, Git consistently uses the term `rev` in plumbing commands as short for "revision" and generally meaning the 40-character SHA1 hash for a commit. The command `rev-list` for example prints a list of 40-char commit hashes for a branch or whatever.

In this case the name might be expanded to `parse-a-commitish-to-a-full-SHA1-hash`. While the command has the several ancillary functions mentioned in Tuxdude's answer, its namesake appears to be the use case of transforming a user-friendly reference like a branch name or abbreviated hash into the unambiguous 40-character SHA1 hash most useful for many programming/plumbing purposes.

</br>

## delete merged branches
See [this SO answer](https://stackoverflow.com/questions/6127328/how-do-i-delete-all-git-branches-which-have-been-merged?noredirect=1&lq=1).


## upstream branch
Run `git branch -vv`. This will show you which remote (upstream) branch you are working on your local branch and how many commits you are behind or ahead.
Run `git fetch` (assuming you have set up branch tracking there is no need to specify the branch your're fetching). This makes your repository (**not** staging area or working area) up-to-date with remote. 



----
## Fetch
According to [this SO](https://stackoverflow.com/questions/58269028/is-git-push-atomic) When you (or anyone) run `git pull` you're really running `git fetch` followed by a second, purely local, Git command. The `git fetch` is similar to `git push` in that your Git calls up some other Git, but this time the data transfer goes the other way:

- Your Git gets a listing, from their Git, of all their names and hash IDs. If there's an ongoing push, each pair—name and hash ID—is either from _before_ a requested or commanded update, or from _after:_ there is no in-between visible because their Git respects their own locks.
    
- Then, using the names and hash IDs found in this step, your Git brings over new objects you want and don't have based on this listing.
    
- At the end of this process, your Git _doesn't_ touch any of _your_ branch names—at least not by default (you can override this with _refspec_ arguments). Instead, your Git updates your _remote-tracking names_, such as `origin/master`, to match their names. (Depending on how you run `git fetch`, you can constrain your Git to update only one or a few of your names, rather than all of them; if you're only going to update your `origin/master`, your Git can skip downloading new objects that are only reachable from their `feature-X` that would become your `origin/feature-X`.)
    
The second, purely-local command can do whatever that second command (usually merge unless you select rebase) can do. This part is often _not_ atomic: e.g., during a rebase, your rebase may stop in the middle with only some commits copied, forcing you to fix the conflict and run `git rebase --continue`. But this is all in _your_ repository, which no one else shares. (Your Git also does its own lock/unlock operations across your own branch-name and other-name updates, in case you're running another Git command in the background, or via a cron job, or whatever.)


----
### Basic Config
```bash
git config --global user.name "sample_name"
git config --global user.email "sample_email@sample.com"
git config --global core.editor "nano"
```
#### ssh
See bash-docker.md file.
</br>

##  Quera Course
### remote
`git remote add <NAME> <REPOSITORY_URL>`
For example:
`git remote add origin https://github.com/QueraTeam/test-repository.git`

### push & fetch & pull
`git push [-u] [<REPOSITORY>] [<BRANCH>]`
For `[<REPOSITORY>]` we can use url or the name of remote (like `origin`). If you don't specify `[<REPOSITORY>]`, its value will be automatically assigned based on prevois values.
  
`git fetch [<REPOSITORY>] [<BRANCH>]`

Using `-t` will *also* pull the tags.
`git pull -t [<REPOSITORY>] [<BRANCH>]`

### merge
اگر احیانا در پروسه حل کردن کانفلیکت‌ها اشتباهاتی انجام دهیم، به راحتی و با دستور زیر می‌توانیم از حالت مرج خارج شویم و فایل‌هایمان را به حالت قبل از مرج برگردانیم
`git merge --abort`

<div dir="rtl">
فرض کنید می‌خواهیم برنچی به نام `feature1` را با برنچ `main` مرج کنیم. اگر بخواهیم می‌توانیم قبل از مرج کردن، در حالی که روی برنچ `main` هستیم با استفاده از دستور زیر اختلاف بین این دو برنچ را مشاهده کنیم:
</div>
`git diff feature1`

<div dir="rtl">
به طور کلی دستور `diff` برای مشاهده اختلاف بین دو نسخه مختلف از پروژه استفاده می‌شود. هر کدام از این دو نسخه می‌توانند یک کامیت، یک برنچ یا یک تگ باشند. همچنین در صورتی که بخواهیم می‌توانیم با استفاده از دو دستور زیر اختلاف بین پروژه لوکال و آخرین وضعیت پروژه روی برنچ `main` سرور ریموت را مشاهده کنیم:
</div>
```bash
git fetch
git diff ..origin/main
```


### tracking branch in simple words

<div dir="rtl">
می‌توان به زبان ساده‌تر گفت برنچ ردیابی نشانگری است که به آخرین کامیت هر برنچ در هنگام دریافت از سرور اشاره می‌کند. در شکل زیر مشاهده می‌کنید که با دریافت اطلاعات از سرور، یک نشانگر به آخرین کامیت دریافتی با نام `origin/main` زده شده است.
</div>

#### revert
<div dir="rtl">
یک نکته که باید به آن توجه کرد این است که این دستور، معکوس تغییرات رخ داده در یک کامیت را روی وضعیت فعلی اعمال می‌کند و اگر فایل‌ها شامل تغییراتی باشند که با تغییرات کامیت گفته شده تفاوت داشته باشند، یک کانفلیکت رخ می‌دهد. برای پیشگیری از این اتفاق بهتر است که به ترتیب کامیت‌ها را `revert` کنیم. مثلا اگر می‌خواهیم ۳ کامیت به گذشته برویم به ترتیب کامیت آخر، یکی مانده به آخر و دوتا مانده به آخر را revert کنیم. همچنین می‌توان دنباله‌ای از کامیت‌ها به این دستور داد تا همه آن‌ها را به ترتیب انجام دهد. به طور مثال `revert` کردن به سه کامیت گذشته با دستور زیر امکان‌پذیر است.
</div>
‍‍`git revert HEAD HEAD~1 HEAD~2`



