import { Visual } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api"
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];

var iconLibrary2ED14D8B4AED4D3384A40EAC399CE900: IVisualPlugin = {
    name: 'iconLibrary2ED14D8B4AED4D3384A40EAC399CE900',
    displayName: 'Icon Library',
    class: 'Visual',
    apiVersion: '2.6.0',
    create: (options: VisualConstructorOptions) => {
        if (Visual) {
            return new Visual(options);
        }

        throw 'Visual instance not found';
    },
    custom: true
};

if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["iconLibrary2ED14D8B4AED4D3384A40EAC399CE900"] = iconLibrary2ED14D8B4AED4D3384A40EAC399CE900;
}

export default iconLibrary2ED14D8B4AED4D3384A40EAC399CE900;