## Kill

You may to want to kill all processes based on some keyword. Run the following. But **don't** use something like "nodejs" as keyword, since it will disrupt your Skype, Slack, VSCode and any program which has fired up nodejs process.  
&emsp;  `ps aux | grep "<keyword>" | tr -s ' ' | cut -d ' ' -f 2 | xargs kill -SIGKILL`