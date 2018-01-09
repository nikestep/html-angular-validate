const component = {
    template: `
        <div>
            <div>
                Some content.
            </div>
    `,
    controller: class ComponentController {
        constructor() {
            console.log('This is the constructor')
        }
    }
}