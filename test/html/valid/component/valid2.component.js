const template = ''
+'    <div id="dvContainer" class="container top-level">'
+'         <span class="label">Nothing Special Div Fragment</span>'
+'         <div>'
+'             <ul>'
+'                 <li>Item One</li>'
+'                 <li>Item Two</li>'
+'                 <li>Item Three</li>'
+'             </ul>'
+'         </div>'
+'     </div>';

const component = {
    template: template,
    controller: class ComponentController {
        constructor() {
            console.log('This is the constructor')
        }
    }
}
