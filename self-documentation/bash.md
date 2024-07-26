# Bash
## Kill

You may to want to kill all processes based on some keyword. Run the following. But **don't** use something like "nodejs" as keyword, since it will disrupt your Skype, Slack, VSCode and any program which has fired up nodejs process.  
&emsp;  `ps aux | grep "<keyword>" | tr -s ' ' | cut -d ' ' -f 2 | xargs kill -SIGKILL`

It's recommended to use `pkill` or `killall` for these purposes. They're also native to ubuntu. Read more on [this stack exchange answer](https://unix.stackexchange.com/a/252360).

## grep

`grep -r --no-filename "docker" -A 2 -B 2 .`
Note, `-r` is necessary if you want to search in a directory (not a file).


## print n-th word  

According to [baeldung](https://www.baeldung.com/linux/bash-extract-first-word), We mainly use `awk` for text processing that involves data manipulation and calculations:
`git show-ref --heads | head -1 | awk '{print $1}'`

</br>  


## curl & while

`cur -sI -o /dev/null -w "%{http_code}\n" https://example.com` 
Flag `-s` is silent mode. `-I` is going to do a HEAD request so it doesn't bother to parse the response, only the headers. Flag `-o path` redirects the output.  
If you want to do it every second, you can write the following one-line command:   
`while curl -sI -o /dev/null -w "%{http_code}\n" https://example.com ; do sleep 1; done;`

If you want to run multiple commands in every iteration of the loop, you can write like this: `while true; do echo hello && sleep 1; done;`

</br>

## jq
See [jq official tutorial](https://jqlang.github.io/jq/tutorial/).

## really clear terminal  
run `tput reset`.

## install automation using sed
https://www.monolune.com/articles/installing-apt-packages-from-a-requirements-file/.


## ssh

Based on quera git:
1) Open bash (or git bash on Windows).
2) Run `ssh-keygen` and enter 3 times (for default).
3) Run `eval ssh-agent`
4) On Linux/Windows run: `ssh-add ~/.ssh/id_rsa`
5) Now the key is created. You just need to config public key on the server you are going to connnect. You can get the value of public key by: `cat ~/.ssh/id_rsa.pub`    
6) After you've configured public key on the server, check if you can connect by running: `ssh -T git@git.quera.ir`  . If this is the first time, you have to enter yes on the questions.

Note: If you want to save ssh keys at some different location (not .ssh folder) or if you want have more control over ssh key (like algorithm, etc.), take a look at [this SO answer](https://stackoverflow.com/a/32914164).

**Note:** Every time you restart the computer, you must make sure the identity is added. In other words, you should go thorugh step 3 and 4 again. If you want to automate this, take a look [this SU link](https://superuser.com/a/1114257).
To Remove Specific Identity: `ssh-add -d ~/.ssh/sshkeynamewithout.pub`
Find list of available Identify by using: `ssh-add -l`

</br>


## core utils
find number of occurences of each word and sort:
```bash
cat subtitles.txt | xargs | tr ' ' '\n' | sort | uniq -c | sort -nr
```

Each line contains list of space-seperated numbers. Find maximum sum:
```bash
echo "3 5 11\n23 11 15" | tr " " "+" | bc | sort -nr | head -1
```
