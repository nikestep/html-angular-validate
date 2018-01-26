const template = ''
+'    <div>'
+'        <div>'
+'            Some content.'
+'        </div>';

const component = {
    template: template,
    controller: class ComponentController {
        constructor() {
            console.log('This is the constructor')

            const dialogComponent = ''
            +'    <div>'
            +'        <div>'
            +'            Some content.'
            +'        </div>';
        }
    }
}
