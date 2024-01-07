## Why ejs?

EJS and Pug are roughly equivalent in terms of functionality. Even though EJS is kind of ugly, it's much easier to pass around between different people without confusion.

</br>


## aria-busy, aria-live
Be careful about aria-busy. Read Craig Kovatch's comment in https://stackoverflow.com/a/38708396.
https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live.

## Hiding from screen-reader
https://webaim.org/techniques/css/invisiblecontent/.
https://www.linkedin.com/pulse/hiding-elements-from-screen-readers-girijesh-tripathi.  
https://snook.ca/archives/html_and_css/hiding-content-for-accessibility.


## Show loading until scripts download
https://stackoverflow.com/a/63927295.
https://stackoverflow.com/a/13122014.
  
  
According to https://stackoverflow.com/a/18411986:
The defer attribute causes the browser to defer execution of the script until after the document has been loaded and parsed and is ready to be manipulated. The async attribute causes the browser to run the script as soon as possible but not to block document parsing while the script is being downloaded – shuseel

Also a minor note about `s.async` according https://stackoverflow.com/a/14813913 and the comment below it:
s.async = true is correct. The property async is specified explicitly as a boolean in W3C's HTML 5 recommendation at w3.org/TR/html5/scripting-1.html#attr-script-async. You are confusing the async attribute with the async property exposed by objects implementing the HTMLScriptElement DOM interface. Indeed, when manipulating the corresponding attribute of the element through something like Element.setAttribute, you should use element.setAttribute("async", "async") as all HTML attributes are first and foremost text. – Armen Michaeli