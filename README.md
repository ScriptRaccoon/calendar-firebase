# Calendar App with Firebase

This is a calendar app built just using JavaScript, CSS and HTML. Firebase is used for authentication and storage of events.

https://wherethetimegoes.netlify.app/

Responsive design and a single day display mode make it possible to use this app also on a phone.

Notice that this an improvement of my [previous calendar app](https://github.com/ScriptRaccoon/calendar) in which the events could only be stored in localStorage, hence there was no auth, and the design was not responsive.

## Local development

Install the dependencies with `npm install`. During development, run `npm run dev` to compile all the JS and CSS files via gulp. For production, use `npm run build`. Then open `public/index.html`.
