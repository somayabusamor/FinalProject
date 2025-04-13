const myDiv: HTMLDivElement = document.createElement('div');

// Setting properties
myDiv.id = 'myDiv';
myDiv.className = 'my-class';
myDiv.innerHTML = '<p>Hello, World!</p>';

// Adding styles
myDiv.style.backgroundColor = 'lightblue';
myDiv.style.padding = '20px';

// Appending to the DOM
document.body.appendChild(myDiv);
