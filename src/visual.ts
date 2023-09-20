"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import {
     TooltipEventArgs,
     TooltipEnabledDataPoint,
     createTooltipServiceWrapper,
     ITooltipServiceWrapper,
   } from 'powerbi-visuals-utils-tooltiputils'
import TooltipShowOptions = powerbi.extensibility.TooltipShowOptions;
   import IVisualHost = powerbi.extensibility.visual.IVisualHost;
import { VisualSettings } from "./settings";
import { iconFamilies } from "./icondata";
import { iconLibrary } from "./icondata";
import * as d3 from "d3";
import { DataViewProperties } from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjectsParser";
import { now } from "d3";
import IVisualEventService = powerbi.extensibility.IVisualEventService;

type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class Visual implements IVisual {
    private events: IVisualEventService ;
    private target: HTMLElement;
    //private svg: d3.Selection<SVGElement, {}, HTMLElement, any>;
    private updateCount: number;
    private textNode: Text;
    private container: HTMLElement;
    private updateOptions: VisualUpdateOptions;
    private wasClicked: boolean;
    private tooltipServiceWrapper: ITooltipServiceWrapper;
    private visualSettings: VisualSettings;
    private host: IVisualHost;
    private textX: number;
    private textY:number;
    private iconX:number;
    private iconY:number;
    private textBoxContainer:HTMLElement;
    private textBox:HTMLElement;
    private svgContainer:HTMLElement;
    private svg:Selection<SVGElement>;
    

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;        
        this.wasClicked = false;
        this.updateCount = 0;
        this.host = options.host;
        this.textBoxContainer = document.createElement('div');
        this.textBox = document.createElement('div');
        this.textBoxContainer.appendChild(this.textBox);
        this.target.appendChild(this.textBoxContainer);
        this.svgContainer = document.createElement('div');
        this.target.appendChild(this.svgContainer);
        this.svg = d3.select(this.svgContainer).append('svg')
        this.svg.attr('xmlns','http://www.w3.org/2000/svg');
        this.svg.attr('viewBox','0 0 24 24');
        //<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">

        this.textBoxContainer.style.position = "absolute";        
        this.textBox.style.position = "absolute";
        this.svgContainer.style.position = "absolute";
        this.events = options.host.eventService;
        //setup mouse events
        this.target.onmouseover = () => {
            this.handleMouseOver(true);
        }
        this.target.onmouseout = () => {
            this.handleMouseOver(false);
        } 
        this.target.onclick = () => {
            this.handleClick();
        }       
        if (document) {

        }
    }
    public handleClick(){
        if (this.visualSettings.actionSettings.show == true && this.visualSettings.actionSettings.url != "")
            this.host.launchUrl('https://www.google.com');
    }

    public handleMouseOver(isMouseOver:boolean)
    {
        if (isMouseOver)
        {
            this.textBox.style.color = this.visualSettings.textSettings.getHoverColor().toString();
            this.textBox.textContent = this.visualSettings.textSettings.getHoverText();
            this.textBox.style.padding = this.visualSettings.textSettings.getHoverPadding().toString() + "px";
            this.textBox.style.fontFamily = this.visualSettings.textSettings.getHoverFontFamily();
            this.textBox.style.fontWeight = (this.visualSettings.textSettings.getHoverBold())?"Bold":"normal";
            this.textBox.style.fontSize = this.visualSettings.textSettings.getHoverTextSize() + "pt";
        }
        else
        {
            this.textBox.style.color = this.visualSettings.textSettings.defaultTextColor.toString();
            this.textBox.textContent = this.visualSettings.textSettings.text;
            this.textBox.style.padding = this.visualSettings.textSettings.textPadding + "px";
            this.textBox.style.fontFamily = this.visualSettings.textSettings.fontFamily;
            this.textBox.style.fontWeight = (this.visualSettings.textSettings.boldText)?"Bold":"normal";
            this.textBox.style.fontSize = this.visualSettings.textSettings.textSize + "pt";
        }
        this.positionTextBox();
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        this.updateOptions = options;
        let dataView: DataView = options.dataViews[0];
        this.visualSettings = Visual.parseSettings(dataView);
        
        this.drawVisual(this.visualSettings.iconSettings.iconFamily);
        this.events.renderingFinished(options);

    }
    private drawVisual(iconFamily: string)
    {
        //first set the textbox style properties and text value
        if (this.visualSettings.textSettings.show)
            this.drawTextBox();
        else
        {
            this.textBoxContainer.style.display = "none";
            this.textBoxContainer.style.width = "0px";
            this.textBoxContainer.style.height = "0px";
        }
        this.drawIcon();
    }
    private drawIcon()
    {
        //set width and height
        if (this.visualSettings.textSettings.textLocation == "left" || this.visualSettings.textSettings.textLocation == "right"){
             this.svgContainer.style.width = (this.target.offsetWidth - this.textBoxContainer.offsetWidth).toString() + "px";
             this.svgContainer.style.height = "100%";
        }
        else
        {
            this.svgContainer.style.width = "100%";
            this.svgContainer.style.height = (this.target.offsetHeight - this.textBoxContainer.offsetHeight).toString() + "px";
        }
        //set location
        if (this.visualSettings.textSettings.textLocation == "top")
            this.svgContainer.style.top = this.textBoxContainer.offsetHeight.toString() + "px";
        else
            this.svgContainer.style.top = "0px";            
        if (this.visualSettings.textSettings.textLocation == "left")
            this.svgContainer.style.left = this.textBoxContainer.offsetWidth.toString() + "px";
        else
            this.svgContainer.style.left = "0px";
        //set icon path details
        this.svg.html(iconLibrary.get(this.visualSettings.iconSettings.getActiveIconName()));
        this.svg.style('width',"100%");
        this.svg.style('height',"100%");
        this.svg.style('fill',this.visualSettings.iconSettings.iconColor.toString());
    }
    private drawTextBox()
    {
        this.textBoxContainer.style.display = "block";
        this.textBox.textContent = this.visualSettings.textSettings.text;
        this.textBox.style.color = this.visualSettings.textSettings.defaultTextColor.toString();
        this.textBox.style.fontFamily = this.visualSettings.textSettings.fontFamily;        
        this.textBox.style.fontSize = this.visualSettings.textSettings.textSize + "pt";
        this.textBox.style.fontWeight = (this.visualSettings.textSettings.boldText)?"Bold":"normal";
        this.textBox.style.textAlign = this.visualSettings.textSettings.horTextAlign;
        this.textBox.style.padding = this.visualSettings.textSettings.textPadding + "px";
        this.positionTextBox();         
    }

    private positionTextBox(){
        this.textBoxContainer.style.left = (this.visualSettings.textSettings.textLocation == "left")? "0px":"";
        this.textBoxContainer.style.right = (this.visualSettings.textSettings.textLocation == "right")? "0px":"";
        this.textBoxContainer.style.top = (this.visualSettings.textSettings.textLocation == "top")? "0px":"";
        this.textBoxContainer.style.bottom = (this.visualSettings.textSettings.textLocation == "bottom")? "0px":"";        
        if (this.visualSettings.textSettings.textLocation == "left" || this.visualSettings.textSettings.textLocation == "right"){
            this.textBoxContainer.style.width = this.visualSettings.textSettings.textWidth.toString() + "%"
            this.textBoxContainer.style.height = "100%";        
            this.textBox.style.width = (this.textBoxContainer.offsetWidth - (2*this.visualSettings.textSettings.textPadding)).toString() + "px";
        }
        else{
            this.textBoxContainer.style.width =  "100%";
            this.textBoxContainer.style.height = "";
            this.textBox.style.width = ((this.visualSettings.textSettings.textWidth/100) * this.textBoxContainer.offsetWidth- (2*this.visualSettings.textSettings.textPadding)).toString() + "px";
        }        
        if (this.textBoxContainer.offsetHeight < this.textBox.offsetHeight) this.textBoxContainer.style.height = this.textBox.offsetHeight.toString()+"px";
        if (this.visualSettings.textSettings.verticalAlignment == "top")
        {
            this.textBox.style.top = "0px";  
            this.textBox.style.bottom = "";
        }          
        if (this.visualSettings.textSettings.verticalAlignment == "middle")
        {
            this.textBox.style.top = ((this.textBoxContainer.offsetHeight - this.textBox.offsetHeight)/2).toString() + "px";
            this.textBox.style.bottom = "";
        }  
        if (this.visualSettings.textSettings.verticalAlignment == "bottom")
        {
            this.textBox.style.top = "";
            this.textBox.style.bottom = "0px";
        }  
        if (this.visualSettings.textSettings.horTextAlign == "left")
        {
            this.textBox.style.left = "0px";  
            this.textBox.style.right = "";
        }          
        if (this.visualSettings.textSettings.horTextAlign == "center")
        {
            this.textBox.style.left = ((this.textBoxContainer.offsetWidth - this.textBox.offsetWidth)/2).toString() + "px";
            this.textBox.style.right = "";
        }  
        if (this.visualSettings.textSettings.horTextAlign == "right")
        {
            this.textBox.style.left = "";
            this.textBox.style.right = "0px";
        } 
    }
    
    private static parseSettings(dataView: DataView): VisualSettings {
        var settings:VisualSettings = <VisualSettings>VisualSettings.parse(dataView);
        return settings;
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        const settings: VisualSettings = this.visualSettings || <VisualSettings>VisualSettings.getDefault();
        let objectName: string = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

         switch (objectName) {
            case 'textSettings':                      
                return this.enumerateTextSettings();
            break;
            case 'iconSettings':
                return this.enumerateIconSettings();
            break;
            default:
                return VisualSettings.enumerateObjectInstances(settings, options);
             }
         return objectEnumeration;
        //return VisualSettings.enumerateObjectInstances(settings, options);
    }
    private enumerateIconSettings():VisualObjectInstance[]{
        let objectEnumeration: VisualObjectInstance[] = [];
        objectEnumeration.push({
            objectName: "iconSettings",
            properties:{
                iconFamily: this.visualSettings.iconSettings.iconFamily
            },
            selector: null
        });
        switch (this.visualSettings.iconSettings.iconFamily){
            case "Buildings":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconBuildings: this.visualSettings.iconSettings.iconBuildings
                    },
                    selector: null
                });
                break;
            case "Business":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconBusiness: this.visualSettings.iconSettings.iconBusiness
                    },
                    selector: null
                });
                break;
            case "Communication":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconCommunication: this.visualSettings.iconSettings.iconCommunication
                    },
                    selector: null
                });
                break;
            case "Design":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconDesign: this.visualSettings.iconSettings.iconDesign
                    },
                    selector: null
                });
                break;
            case "Development":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconDevelopment: this.visualSettings.iconSettings.iconDevelopment
                    },
                    selector: null
                });
                break;
            case "Device":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconDevice: this.visualSettings.iconSettings.iconDevice
                    },
                    selector: null
                });
                break;
            case "Document":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconDocument: this.visualSettings.iconSettings.iconDocument
                    },
                    selector: null
                });
                break;
            case "Editor":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconEditor: this.visualSettings.iconSettings.iconEditor
                    },
                    selector: null
                });
                break;
            case "Finance":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconFinance: this.visualSettings.iconSettings.iconFinance
                    },
                    selector: null
                });
                break;
            case "Health":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconHealth: this.visualSettings.iconSettings.iconHealth
                    },
                    selector: null
                });
                break;
            case "Logos":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconLogos: this.visualSettings.iconSettings.iconLogos
                    },
                    selector: null
                });
                break;
            case "Map":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconMap: this.visualSettings.iconSettings.iconMap
                    },
                    selector: null
                });
                break;
            case "Media":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconMedia: this.visualSettings.iconSettings.iconMedia
                    },
                    selector: null
                });
                break;
            case "Others":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconOthers: this.visualSettings.iconSettings.iconOthers
                    },
                    selector: null
                });
                break;
            case "System":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconSystem: this.visualSettings.iconSettings.iconSystem
                    },
                    selector: null
                });
                break;
            case "User":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconUser: this.visualSettings.iconSettings.iconUser
                    },
                    selector: null
                });
                break;
            case "Weather":
                objectEnumeration.push({
                    objectName: "iconSettings",
                    properties:{
                        iconWeather: this.visualSettings.iconSettings.iconWeather
                    },
                    selector: null
                });
                break;
        }
        objectEnumeration.push({
            objectName: "iconColor",
            properties:{
                iconColor: this.visualSettings.iconSettings.iconColor
            },
            selector: null
        });
        return objectEnumeration;
    }

    private enumerateTextSettings():VisualObjectInstance[]{
        let objectEnumeration: VisualObjectInstance[] = [];
        switch(this.visualSettings.textSettings.controlState){
            case 'default':
                objectEnumeration.push({
                    objectName: 'textSettings',
                    properties: {
                        show: this.visualSettings.textSettings.show,
                        controlState: this.visualSettings.textSettings.controlState,
                        text: this.visualSettings.textSettings.text,
                        defaultTextColor: this.visualSettings.textSettings.defaultTextColor,
                        textPadding: this.visualSettings.textSettings.textPadding,
                        textWidth: this.visualSettings.textSettings.textWidth,
                        verticalAlignment: this.visualSettings.textSettings.verticalAlignment,
                        horTextAlign: this.visualSettings.textSettings.horTextAlign,
                        textSize: this.visualSettings.textSettings.textSize,
                        fontFamily: this.visualSettings.textSettings.fontFamily,
                        boldText: this.visualSettings.textSettings.boldText,
                        textLocation: this.visualSettings.textSettings.textLocation
                    },
                    selector: null
                }); 
            break;
            case 'onhover':
                objectEnumeration.push({
                    objectName: 'textSettings',
                    properties: {
                        show: this.visualSettings.textSettings.show,
                        controlState: this.visualSettings.textSettings.controlState,
                        hoverText: this.visualSettings.textSettings.getHoverText(),
                        hoverTextColor: this.visualSettings.textSettings.getHoverColor(),
                        hoverTextPadding: this.visualSettings.textSettings.getHoverPadding(),
                        textWidth: this.visualSettings.textSettings.textWidth,
                        verticalAlignment: this.visualSettings.textSettings.verticalAlignment,
                        horTextAlign: this.visualSettings.textSettings.horTextAlign,
                        fontSize: this.visualSettings.textSettings.getHoverTextSize(),
                        hoverFontFamily: this.visualSettings.textSettings.getHoverFontFamily(),
                        hoverBoldText: this.visualSettings.textSettings.getHoverBold(),
                        textLocation: this.visualSettings.textSettings.textLocation
                    },
                    selector: null
                });
            break;
        }
        return objectEnumeration;
    }
}