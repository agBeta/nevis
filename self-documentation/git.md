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

## Undo all uncomitted changes

The safest way (without removing ignored files, like `.env` or `node_modules`) is the following. This is based on [this stackoverflow answer](https://stackoverflow.com/questions/14075581/git-undo-all-uncommitted-or-unsaved-changes).
&emsp; `git add . && git stash && git stash drop`

</br>

## `.gitattributes`

We use .gitattributes to solve `LF vs CRLF` problem and normalize our repository (based on [git docs](https://git-scm.com/docs/gitattributes#_text)). [This blog] (https://www.aleksandrhovhannisyan.com/blog/crlf-vs-lf-normalizing-line-endings-in-git/) gives a very detailed explanation about `CRLF` and `LF`. **Note**, If you have files added to Git index _prior_ to .gitattribute addition, you must run `git add --renormalize .` command.

</br>

## New Branch and Worktree

If you use git worktree, simply run `git worktree add <path>`. According to [git docs](https://git-scm.com/docs/git-worktree#_description), it automatically creates a **new** branch whose name is the final component of `<path>`. To instead, work on an **existing** branch in a new worktree, use `git worktree add <path> <branch>`. Also you can specify `-d` flag to create a **throwaway** worktree not associated with any branch.

If you want to delete a branch, you must first remove its worktree.

</br>

## Better Log

If you want to see git logs for a file in the last hour, it is recommended to use some other flags to also include history of file before it was renamed. We assume you **always** rename or move your repository files using `git mv` (otherwise, the following command will **not** show the actual history). You can run:  
 `git log --since="1 hour ago" --name-status --follow -- <path to file>`  
If you do not specify last two flags, the result will end on the commit in which the file was renamed/moved.

</br>

Chances are that you have renamed a file in some commit, but you do not remember its current name. You can use `--diff-filter` flag so that the result selectively includes (or exludes) files that have been renamed or deleted. For rename you can run: `git log --diff-filter=R`.

</br>

If you want the first line of last 5 commits to be shown inside the terminal without their hash, you can run `git --no-pager log -5 --oneline --pretty=format:%s`. See [git docs](https://git-scm.com/docs/pretty-formats) for documentation.  

</br>

## Other useful `show` & `diff` commands

You can run `git show <commit>:<file>`. If the file does not exist in the commit it will display an error. For example, if you want to know contents of package.json in two commits ago (following the 1st parent of `HEAD`), you can run: `git show HEAD~2:package.json`

</br>

If you only want to know which files changed in the latest commit, run `git show HEAD~1 --stat` . The result will show the commit message, along with name of the files that were changed and how many insertions/deletion/etc were made. If you omit `--stat` flag, it will dislay commit and its textual diff.

</br>

If you want to know unstaged changes (i.e. what *could* be in the next commit), run  `git diff` . If you want to know staged changes (i.e. already `git add`ed and *will* be in the next commit) use `--staged` flag at the end.

</br>
https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging.
`git add -i`  --> `u`  --> `2,3` --> enter again.
You can also do Staging Patches (identical to `git add -p`) with letter `p`.

</br>
## From Git book
### Creating a Branch from a Stash
See https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning.

### Searching
https://git-scm.com/book/en/v2/Git-Tools-Searching
If, for example, we want to find out when the ZLIB_BUF_MAX constant was originally introduced, we can use the -S option (colloquially referred to as the Git “pickaxe” option) to tell Git to show us only those commits that changed the number of occurrences of that string.
`git log -S ZLIB_BUF_MAX --oneline`

https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified.
https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging.

</br>

## Undo commits
Follow these step:  
1. In order to have a rescure plan in case of any disastrous action, you may want to save (also see Note 1 below) the hash of current HEAD (Although `ORIG_HEAD` helps us, but we may jump around a lot). So run `git rev-parse --verify HEAD`. So now, the hash is saved in our bash history and we can `checkout` or `reset` or `branch happy <hash>` to this commit hash in case of disaster (it won't be garbage collected any time soon, accoding to [git docs](https://git-scm.com/docs/git-gc#Documentation/git-gc.txt-gcreflogExpireUnreachable)).  
Note 1: You don't have to save the hash of current HEAD in bash history, because `git reflog show` will display old values of a reference.  
Note 2: If you want to undo only **the last commit** then stashing is a better rescue alternative (run `git stash save --include-untracked "WIP: save changes in case of disaster"`).  

2. Then `git reset --mixed HEAD~2`. Your working area is still untouched, at the moment. But if you instead use `--hard` flag, your working area will be overwritten.


</br>

## commit hash of remote (useful for rebase)
`git branch -r` causes the remote-tracking branches to be listed, and option -a shows both local and remote branches.
`git rev-parse $(git branch -r --sort=committerdate | tail -1) `

## git rev-parse
A satisfying way to think of it: https://stackoverflow.com/a/28249368.