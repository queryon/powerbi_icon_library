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
import ISelectionManager = powerbi.extensibility.ISelectionManager;
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
    private visualSettings: VisualSettings;
    private host: IVisualHost;
    private textBoxContainer:HTMLElement;
    private textBox:HTMLElement;
    private svgContainer:HTMLElement;
    private svg:Selection<SVGElement>;
    private previewContainer:HTMLElement;
    private previewTextBox:HTMLElement;
    private previewGoButton:HTMLElement;
    private changeIconButton:HTMLElement;
    private previewIconContainer:HTMLElement;
    private lastOptions: VisualUpdateOptions;
    private selectionManager: ISelectionManager;
    private renderingFailed: boolean = true;
    
    private instantiateHTMLElements()
    {
        this.textBoxContainer = document.createElement('div');
        this.textBox = document.createElement('div');
        this.textBoxContainer.appendChild(this.textBox);
        this.target.appendChild(this.textBoxContainer);
        this.svgContainer = document.createElement('div');
        this.target.appendChild(this.svgContainer);
        this.svg = d3.select(this.svgContainer).append('svg')
        //this.svg.attr('xmlns','http://www.w3.org/2000/svg');
        this.svg.attr('viewBox','0 0 24 24');
        
        //setting up icon preview stuff
        var previewtextheight:string = "50px";
        this.previewContainer = document.createElement('div');
        this.previewContainer.style.width = '100%';        
        this.previewContainer.style.height = '100%';
        //this.previewContainer.style.backgroundColor = '#990033';
        this.previewTextBox = document.createElement('div');
        this.previewTextBox.style.width = '75%';
        this.previewTextBox.style.minHeight = previewtextheight;
        this.previewTextBox.style.position = "absolute";
        this.previewTextBox.style.fontSize = '26pt';
        this.previewTextBox.style.backgroundColor = "#ffffff";
        this.previewTextBox.textContent = "Please select an icon";
        this.previewTextBox.id = "previewTextBox";
        this.previewContainer.appendChild(this.previewTextBox);
        this.previewGoButton = document.createElement('div');
        this.previewGoButton.style.width = '25%';
        this.previewGoButton.style.height = previewtextheight;
        this.previewGoButton.style.position = "absolute";
        this.previewGoButton.style.right = '0px';
        this.previewGoButton.style.backgroundColor = '#00BAAE';
        this.previewGoButton.textContent = "GO";
        this.previewGoButton.style.fontSize = '26pt';
        this.previewGoButton.style.textAlign = 'center';
        this.previewGoButton.style.fontWeight = 'Bold';
        this.previewGoButton.style.color = 'White';
        this.previewContainer.appendChild(this.previewGoButton);
        this.previewIconContainer = document.createElement('div');
        this.previewIconContainer.style.width = '100%';
        this.previewIconContainer.style.position = 'absolute';
        this.previewIconContainer.style.top = previewtextheight;
        this.previewIconContainer.style.overflowY = "scroll";
        this.previewIconContainer.id = "previewIconContainer";
        this.previewContainer.appendChild(this.previewIconContainer);

        this.changeIconButton = document.createElement('div');
        this.changeIconButton.style.width = '30%';
        this.changeIconButton.style.maxWidth = '200px';
        this.changeIconButton.style.height = previewtextheight;
        this.changeIconButton.style.position = "absolute";
        this.changeIconButton.style.right = '0px';
        this.changeIconButton.style.backgroundColor = '#00BAAE';
        this.changeIconButton.textContent = "CHANGE ICON";
        this.changeIconButton.style.fontSize = '26pt';
        this.changeIconButton.style.textAlign = 'center';
        this.changeIconButton.style.fontWeight = 'Bold';
        this.changeIconButton.style.color = 'White';
        this.changeIconButton.style.display = 'none';
        this.target.appendChild(this.changeIconButton);
        
        this.textBoxContainer.style.position = "absolute";        
        this.textBox.style.position = "absolute";
        this.svgContainer.style.position = "absolute";
        this.previewContainer.style.position = 'absolute';
        this.target.appendChild(this.previewContainer);
    }

    constructor(options: VisualConstructorOptions) {
        this.target = options.element; 
        this.host = options.host;
        this.events = options.host.eventService;
        this.selectionManager = this.host.createSelectionManager();
        this.instantiateHTMLElements();        
        //setup mouse events
        this.target.onmouseenter = () => {
            this.handleMouseOver(true);
        }
        this.target.onmouseleave = () => {
            this.handleMouseOver(false);
        } 
        this.textBoxContainer.onclick = (event) => {
            this.handleClick(event);
        }  
        //this.svgContainer.onclick = () => {
        //    this.handleClick();
        //} 
        this.target.addEventListener("contextmenu", (event) => { this.handleContextMenuRightClick(event) } );
        this.svgContainer.addEventListener("click",(event) => {
            this.handleClick(event);
        } )  ;
        this.previewGoButton.onclick = () => {
            this.previewGoClick();
        }   
        this.changeIconButton.onclick = () => {
            this.resetIconSelection();
        }
        if (document) {

        }
    }
    public resetIconSelection(){

        this.drawVisual(true, "no selection");
    }
    // Handle context menu - right click 
    private handleContextMenuRightClick(theEvent:MouseEvent) {
        var test = theEvent.x
        this.selectionManager.showContextMenu( {}, {
            x: theEvent.x,
            y: theEvent.y
        });
        theEvent.preventDefault();
    }
    public handleClick(theEvent:MouseEvent){
        if (this.visualSettings.actionSettings.show == true && this.visualSettings.actionSettings.url != "")
        {
             if (this.lastOptions.viewMode == 1) {
                 const isCtrlPressed: boolean = theEvent.ctrlKey;
                 if (isCtrlPressed)
                     this.host.launchUrl(this.visualSettings.actionSettings.url);
             }
             else
                this.host.launchUrl(this.visualSettings.actionSettings.url);
        }
    }
    public previewIconClick(svgIcon:Selection<SVGElement>){
        var childrens = d3.selectAll("#previewIconContainer svg");
        childrens.style("background-color","transparent");
        var theColor = this.visualSettings.iconSettings.getIconColor().toString() ;
        childrens.style("fill",theColor);
        this.previewTextBox.textContent = svgIcon.data()[0]
        svgIcon.style("background-color",theColor);
        svgIcon.style("fill","#ffffff");
        this.previewIconContainer.style.top = Math.round(this.previewTextBox.offsetHeight * 1.33).toString() + "px";
    }
    public previewGoClick(){
        var updateValue = this.previewTextBox.textContent;
        this.updateIconSettings(this.visualSettings.iconSettings.iconFamily, updateValue);        
        //going to update the viisual just in case we don't get everything updated
        this.drawVisual(false,updateValue);
        //update the in memory iconName
        this.previewTextBox.setAttribute("data-value",updateValue);
        this.visualSettings.iconSettings.iconBuildings = updateValue;
        this.visualSettings.iconSettings.iconBusiness = updateValue;
        this.visualSettings.iconSettings.iconCommunication = updateValue;
        this.visualSettings.iconSettings.iconDesign = updateValue;
        this.visualSettings.iconSettings.iconDevelopment = updateValue;
        this.visualSettings.iconSettings.iconDevice = updateValue;
        this.visualSettings.iconSettings.iconDocument = updateValue;
        this.visualSettings.iconSettings.iconEditor = updateValue;
        this.visualSettings.iconSettings.iconFinance = updateValue;
        this.visualSettings.iconSettings.iconHealth = updateValue;
        this.visualSettings.iconSettings.iconLogos = updateValue;
        this.visualSettings.iconSettings.iconMap = updateValue;
        this.visualSettings.iconSettings.iconMedia = updateValue;
        this.visualSettings.iconSettings.iconOthers = updateValue;
        this.visualSettings.iconSettings.iconSystem = updateValue;
        this.visualSettings.iconSettings.iconUser = updateValue;
        this.visualSettings.iconSettings.iconWeather = updateValue;
        //force update. Unfortunately this only works in dev mode and not in a packaged file
        //this.host.refreshHostData();
        this.changeIconButton.style.display = "block";
    }
    private updateIconSettings(iconFamily:string,iconName:string)
    {
        var instance: VisualObjectInstance = {            
            objectName: "iconSettings",
            selector: undefined,
            properties: {
                iconBuildings: "no selection",
                iconBusiness: "no selection",
                iconCommunication: "no selection",
                iconDesign: "no selection",
                iconDevelopment: "no selection",
                iconDevice: "no selection",
                iconDocument: "no selection",
                iconEditor: "no selection",
                iconFinance: "no selection",
                iconHealth: "no selection",
                iconLogos: "no selection",
                iconMap: "no selection",
                iconMedia: "no selection",
                iconOthers: "no selection",
                iconSystem: "no selection",
                iconUser: "no selection",
                iconWeather: "no selection" 
            }
        };
        this.host.persistProperties({merge: [instance]}); 
        switch (iconFamily) {
            case 'Buildings':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconBuildings: iconName}};
            break;
            case 'Business':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconBusiness: iconName}};
            break;
            case 'Communication':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconCommunication: iconName}};
            break;
            case 'Design':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconDesign: iconName}};
            break;
            case 'Development':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconDevelopment: iconName}};
            break;
            case 'Device':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconDevice: iconName}};
            break;
            case 'Document':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconDocument: iconName}};
            break;
            case 'Editor':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconEditor: iconName}};
            break;
            case 'Finance':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconFinance: iconName}};
            break;
            case 'Health':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconHealth: iconName}};
            break;
            case 'Logos':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconLogos: iconName}};
            break;
            case 'Map':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconMap: iconName}};
            break;
            case 'Media':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconMedia: iconName}};
            break;
            case 'Others':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconOthers: iconName}};
            break;
            case 'System':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconSystem: iconName}};
            break;
            case 'User':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconUser: iconName}};
            break;
            case 'Weather':                      
                instance = {objectName: "iconSettings",selector: undefined,
                    properties: {iconWeather: iconName}};
            break;
             } 
             
        this.host.persistProperties({merge: [instance]}); 
    }

    public handleMouseOver(isMouseOver:boolean)
    {
        var isPreview = (this.svgContainer.style.display == "none")
        var state = (isMouseOver)?"hover":"default";
        // if (isMouseOver)
        //     this.drawVisual(false,this.visualSettings.iconSettings.getActiveIconName(),"hover");
        // else
        //     this.drawVisual(false,this.visualSettings.iconSettings.getActiveIconName());
        //on mouse over show change icon button if in edit mode
        if (!isPreview)  
        {      
            //the visual needs to be redrawn to use the On Hover effects
            var iconNameFromVisual = this.previewTextBox.getAttribute("data-value");
            var iconNameFromSettings = this.visualSettings.iconSettings.getActiveIconName();
            var iconName:string = "";
            //you want to use the existing saved data point if it exists       
            if (iconNameFromVisual != null)
                iconName = iconNameFromVisual;
            else
                iconName = iconNameFromSettings; 
            //this.drawVisual(isPreview,this.visualSettings.iconSettings.getActiveIconName(), state);
            this.drawVisual(isPreview,iconName, state);
            this.changeIconButton.style.display = ((isMouseOver && this.lastOptions.viewMode == 1)?"block":"none");
        }
        else
            this.changeIconButton.style.display = "none";
        // if (isMouseOver)
        // {
        //     this.textBox.style.color = this.visualSettings.textSettings.getHoverColor().toString();
        //     this.textBox.textContent = this.visualSettings.textSettings.getHoverText();
        //     this.textBox.style.padding = this.visualSettings.textSettings.getHoverPadding().toString() + "px";
        //     this.textBox.style.fontFamily = this.visualSettings.textSettings.getHoverFontFamily();
        //     this.textBox.style.fontWeight = (this.visualSettings.textSettings.getHoverBold())?"Bold":"normal";
        //     this.textBox.style.fontSize = this.visualSettings.textSettings.getHoverTextSize() + "pt";
        // }
        // else
        // {
        //     this.textBox.style.color = this.visualSettings.textSettings.getTextColor().toString();
        //     this.textBox.textContent = this.visualSettings.textSettings.text;
        //     this.textBox.style.padding = this.visualSettings.textSettings.textPadding + "px";
        //     this.textBox.style.fontFamily = this.visualSettings.textSettings.fontFamily;
        //     this.textBox.style.fontWeight = (this.visualSettings.textSettings.boldText)?"Bold":"normal";
        //     this.textBox.style.fontSize = this.visualSettings.textSettings.textSize + "pt";
        // }
        // this.positionTextBox();
    }
    
    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);
        this.lastOptions = options;
        let dataView: DataView = options.dataViews[0];
        this.visualSettings = Visual.parseSettings(dataView);
        if(options.type == 32 || options.type == 36)
        {
            //debugger;
            var updateValue = this.previewTextBox.textContent;
            if (updateValue != "Please select an icon" && updateValue != "no selection" && updateValue != "")
            {
            this.updateIconSettings(this.visualSettings.iconSettings.iconFamily, updateValue);
            this.previewTextBox.setAttribute("data-value",updateValue);
            this.visualSettings.iconSettings.iconBuildings = updateValue;
            this.visualSettings.iconSettings.iconBusiness = updateValue;
            this.visualSettings.iconSettings.iconCommunication = updateValue;
            this.visualSettings.iconSettings.iconDesign = updateValue;
            this.visualSettings.iconSettings.iconDevelopment = updateValue;
            this.visualSettings.iconSettings.iconDevice = updateValue;
            this.visualSettings.iconSettings.iconDocument = updateValue;
            this.visualSettings.iconSettings.iconEditor = updateValue;
            this.visualSettings.iconSettings.iconFinance = updateValue;
            this.visualSettings.iconSettings.iconHealth = updateValue;
            this.visualSettings.iconSettings.iconLogos = updateValue;
            this.visualSettings.iconSettings.iconMap = updateValue;
            this.visualSettings.iconSettings.iconMedia = updateValue;
            this.visualSettings.iconSettings.iconOthers = updateValue;
            this.visualSettings.iconSettings.iconSystem = updateValue;
            this.visualSettings.iconSettings.iconUser = updateValue;
            this.visualSettings.iconSettings.iconWeather = updateValue;
            }
        }
        //if not a resize event clear existing saved data point
        if (!(options.type == 4 || options.type == 32 || options.type == 36))
            this.previewTextBox.removeAttribute("data-value");
        // else
        // {
        //     //to not lose the setting. save it on a resize
        //     debugger;
        //     var updateValue = this.previewTextBox.textContent;
        //     this.updateIconSettings(this.visualSettings.iconSettings.iconFamily, updateValue); 
        // }
        var iconNameFromVisual = this.previewTextBox.getAttribute("data-value");
        var iconNameFromSettings = this.visualSettings.iconSettings.getActiveIconName();
        var iconName:string = "";
        //you want to use the existing saved data point if it exists and its a resize        
        if (iconNameFromVisual != null && (options.type == 4 || options.type == 32 || options.type == 36))
            iconName = iconNameFromVisual;
        else
            iconName = iconNameFromSettings; 
        var iconValue = this.visualSettings.iconSettings.getActiveIconMap().get(iconName);
        var isPreview:boolean =  (!iconValue || iconName=="no selection") ?true:false;
        //var isPreview:boolean = this.visualSettings.iconSettings.getActiveIconName()=="no selection"?true:false; 
        this.drawVisual(isPreview, iconName);
        if(this.renderingFailed) { // Short circuit if data size is too large for view type
            this.events.renderingFailed(options); // Rendering Events API FAIL
            return;
        }
        this.events.renderingFinished(options);
    }
    private setVisibilities(isPreview:boolean)
    {
        this.changeIconButton.style.display = "none";// (!isPreview?"block":"none");
            this.previewContainer.style.display = (isPreview?"block":"none");
            while (this.previewIconContainer.firstChild) {
                this.previewIconContainer.removeChild(this.previewIconContainer.lastChild);
              }
            this.textBoxContainer.style.display = (isPreview?"none":"block");
            this.svgContainer.style.display = (isPreview?"none":"block");
    }
    private drawVisual(isPreview: boolean, iconName: string, state?:string)
    {      
        this.setVisibilities(isPreview);
        if (isPreview)
            this.drawPreview();
        else
            this.drawFinal(iconName, state);        
    }
    private drawPreview()
    {
        //this.previewTextBox.textContent = "Please select an icon";
        var theMap = this.visualSettings.iconSettings.getActiveIconMap();
        for (let key of theMap.keys()) {
            
            let previewIcon:Selection<SVGElement> = d3.select(this.previewIconContainer).append('svg')
            //previewIcon.attr('xmlns','http://www.w3.org/2000/svg');
            previewIcon.attr('viewBox','0 0 24 24');
            previewIcon.html(theMap.get(key));
            previewIcon.style('width',"10%");
            let test = previewIcon.node().getBoundingClientRect().width;
            previewIcon.style('padding',Math.round(previewIcon.node().getBoundingClientRect().width * 0.25).toString() + "px");
            // previewIcon.style('height',"100%");
            previewIcon.style('fill',this.visualSettings.iconSettings.getIconColor().toString());
            previewIcon.data([key]);
            previewIcon.on("click", () => {
                this.previewIconClick(previewIcon);
            }  );
            if (key == this.previewTextBox.textContent)
            {
                this.previewIconClick(previewIcon)
            }
        }
        //set sizes
        this.previewTextBox.style.fontSize = (Math.round(this.previewTextBox.offsetWidth/13.4)).toString() + "pt";
        this.previewTextBox.style.minHeight = (Math.round(this.previewTextBox.offsetWidth/13.4)*2).toString() + "px";
        this.previewIconContainer.style.top = this.previewTextBox.offsetHeight.toString() + "px";
        this.previewIconContainer.style.height = (this.target.offsetHeight - this.previewTextBox.offsetHeight).toString() + "px";
        
        this.previewGoButton.style.fontSize = (Math.round(this.previewTextBox.offsetWidth/13.4)).toString() + "pt";
        this.previewGoButton.style.height = (Math.round(this.previewTextBox.offsetWidth/13.4)*2).toString() + "px";

        this.previewIconContainer.style.top = Math.round(this.previewTextBox.offsetHeight * 1.33).toString() + "px";
        // this.svg.html(iconLibrary.get(this.visualSettings.iconSettings.getActiveIconName()));
        // this.svg.style('width',"100%");
        // this.svg.style('height',"100%");
        // this.svg.style('fill',this.visualSettings.iconSettings.iconColor.toString());

    }
    private drawFinal(iconName:string, state?:string)
    {        
        //save the iconName for the change button
        this.previewTextBox.textContent = iconName;
        //set change button size
        //92 and 23 are max sizes
        this.changeIconButton.style.fontSize = Math.min((Math.round(this.target.offsetWidth/25)),23).toString() + "pt";
        this.changeIconButton.style.height = Math.min((Math.round(this.target.offsetWidth/25)*4),92).toString() + "px";
        //first set the textbox style properties and text value
        if (this.visualSettings.textSettings.show)
        this.drawTextBox(state);
        else
        {
        this.textBoxContainer.style.display = "none";
        this.textBoxContainer.style.width = "0px";
        this.textBoxContainer.style.height = "0px";
        }
        this.drawIcon(iconName, state);
    }
    private drawIcon(iconName:string, state?:string)
    {
        //set width and height
        if (this.visualSettings.textSettings.getTextLocation(state) == "left" || this.visualSettings.textSettings.getTextLocation(state) == "right"){
             this.svgContainer.style.width = (this.target.offsetWidth - this.textBoxContainer.offsetWidth).toString() + "px";
             this.svgContainer.style.height = "100%";
        }
        else
        {
            this.svgContainer.style.width = "100%";
            this.svgContainer.style.height = (this.target.offsetHeight - this.textBoxContainer.offsetHeight).toString() + "px";
        }
        //set location
        if (this.visualSettings.textSettings.getTextLocation(state) == "top")
            this.svgContainer.style.top = this.textBoxContainer.offsetHeight.toString() + "px";
        else
            this.svgContainer.style.top = "0px";            
        if (this.visualSettings.textSettings.getTextLocation(state) == "left")
            this.svgContainer.style.left = this.textBoxContainer.offsetWidth.toString() + "px";
        else
            this.svgContainer.style.left = "0px";
        //set icon path details
        this.svg.html(this.visualSettings.iconSettings.getActiveIconMap().get(iconName));
        this.svg.style('width',"100%");
        this.svg.style('height',"100%");
        this.svg.style('fill',this.visualSettings.iconSettings.getIconColor(state).toString());
    }
    private drawTextBox(state?:string)
    {
        this.textBoxContainer.style.display = "block";
        this.textBox.textContent = this.visualSettings.textSettings.getText(state);
        this.textBox.style.color = this.visualSettings.textSettings.getTextColor(state).toString();
        this.textBox.style.fontFamily = this.visualSettings.textSettings.getFontFamily(state);        
        this.textBox.style.fontSize = this.visualSettings.textSettings.getTextSize(state) + "pt";
        this.textBox.style.fontWeight = (this.visualSettings.textSettings.getBoldText(state))?"Bold":"normal";
        this.textBox.style.textAlign = this.visualSettings.textSettings.getTextHorAlign(state);
        this.textBox.style.padding = this.visualSettings.textSettings.getPadding(state) + "px";
        this.positionTextBox(state);         
    }

    private positionTextBox(state?:string){
        this.textBoxContainer.style.left = (this.visualSettings.textSettings.getTextLocation(state) == "left")? "0px":"";
        this.textBoxContainer.style.right = (this.visualSettings.textSettings.getTextLocation(state) == "right")? "0px":"";
        this.textBoxContainer.style.top = (this.visualSettings.textSettings.getTextLocation(state) == "top")? "0px":"";
        this.textBoxContainer.style.bottom = (this.visualSettings.textSettings.getTextLocation(state) == "bottom")? "0px":"";        
        if (this.visualSettings.textSettings.getTextLocation(state) == "left" || this.visualSettings.textSettings.getTextLocation(state) == "right"){
            this.textBoxContainer.style.width = this.visualSettings.textSettings.getTextWidth(state).toString() + "%"
            this.textBoxContainer.style.height = "100%";        
            this.textBox.style.width = Math.max((this.textBoxContainer.offsetWidth - (2*this.visualSettings.textSettings.getPadding(state))),0).toString() + "px";
        }
        else{
            this.textBoxContainer.style.width =  "100%";
            this.textBoxContainer.style.height = "";
            this.textBox.style.width = Math.max(((this.visualSettings.textSettings.getTextWidth(state)/100) * this.textBoxContainer.offsetWidth- (2*this.visualSettings.textSettings.getPadding(state))),0).toString() + "px";
        }        
        if (this.textBoxContainer.offsetHeight < this.textBox.offsetHeight) this.textBoxContainer.style.height = this.textBox.offsetHeight.toString()+"px";
        if (this.visualSettings.textSettings.getTextVertAlign(state) == "top")
        {
            this.textBox.style.top = "0px";  
            this.textBox.style.bottom = "";
        }          
        if (this.visualSettings.textSettings.getTextVertAlign(state) == "middle")
        {
            this.textBox.style.top = ((this.textBoxContainer.offsetHeight - this.textBox.offsetHeight)/2).toString() + "px";
            this.textBox.style.bottom = "";
        }  
        if (this.visualSettings.textSettings.getTextVertAlign(state) == "bottom")
        {
            this.textBox.style.top = "";
            this.textBox.style.bottom = "0px";
        }  
        if (this.visualSettings.textSettings.getTextHorAlign(state) == "left")
        {
            this.textBox.style.left = "0px";  
            this.textBox.style.right = "";
        }          
        if (this.visualSettings.textSettings.getTextHorAlign(state) == "center")
        {
            this.textBox.style.left = ((this.textBoxContainer.offsetWidth - this.textBox.offsetWidth)/2).toString() + "px";
            this.textBox.style.right = "";
        }  
        if (this.visualSettings.textSettings.getTextHorAlign(state) == "right")
        {
            this.textBox.style.left = "";
            this.textBox.style.right = "0px";
        } 
    }
    
    private static parseSettings(dataView: DataView): VisualSettings {
        //var settings:VisualSettings = <VisualSettings>VisualSettings.parse(dataView);
        //return settings;
        return <VisualSettings>VisualSettings.parse(dataView);
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
        objectEnumeration.push({objectName: "iconSettings",
            properties:{
                iconLibrary: this.visualSettings.iconSettings.iconLibrary,
                iconFamily: this.visualSettings.iconSettings.iconFamily
            },selector: null
        });
        switch (this.visualSettings.iconSettings.iconFamily){
            case "Buildings":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconBuildings: this.visualSettings.iconSettings.iconBuildings},selector: null});
                break;
            case "Business":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconBusiness: this.visualSettings.iconSettings.iconBusiness},selector: null});
                break;
            case "Communication":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconCommunication: this.visualSettings.iconSettings.iconCommunication},selector: null});
                break;
            case "Design":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconDesign: this.visualSettings.iconSettings.iconDesign},selector: null});
                break;
            case "Development":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconDevelopment: this.visualSettings.iconSettings.iconDevelopment},selector: null});
                break;
            case "Device":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconDevice: this.visualSettings.iconSettings.iconDevice},selector: null});
                break;
            case "Document":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconDocument: this.visualSettings.iconSettings.iconDocument},selector: null});
                break;
            case "Editor":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconEditor: this.visualSettings.iconSettings.iconEditor},selector: null});
                break;
            case "Finance":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconFinance: this.visualSettings.iconSettings.iconFinance},selector: null});
                break;
            case "Health":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconHealth: this.visualSettings.iconSettings.iconHealth},selector: null});
                break;
            case "Logos":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconLogos: this.visualSettings.iconSettings.iconLogos},selector: null});
                break;
            case "Map":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconMap: this.visualSettings.iconSettings.iconMap},selector: null});
                break;
            case "Media":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconMedia: this.visualSettings.iconSettings.iconMedia},selector: null});
                break;
            case "Others":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconOthers: this.visualSettings.iconSettings.iconOthers},selector: null});
                break;
            case "System":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconSystem: this.visualSettings.iconSettings.iconSystem},selector: null});
                break;
            case "User":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconUser: this.visualSettings.iconSettings.iconUser},selector: null});
                break;
            case "Weather":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconWeather: this.visualSettings.iconSettings.iconWeather},selector: null});
                break;
        }
        objectEnumeration.push({objectName: "iconSettings",
            properties:{controlState: this.visualSettings.iconSettings.controlState},selector: null});
        switch (this.visualSettings.iconSettings.controlState){
            case "default":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconColor: this.visualSettings.iconSettings.getIconColor()},selector: null});
            break;
            case "onhover":
                objectEnumeration.push({objectName: "iconSettings",
                    properties:{iconHoverColor: this.visualSettings.iconSettings.getIconColor("hover")},selector: null});
            break;
        }
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
                        text: this.visualSettings.textSettings.getText(),
                        defaultTextColor: this.visualSettings.textSettings.getTextColor(),
                        textPadding: this.visualSettings.textSettings.getPadding(),
                        textLocation: this.visualSettings.textSettings.getTextLocation(),
                        verticalAlignment: this.visualSettings.textSettings.getTextVertAlign(),
                        horTextAlign: this.visualSettings.textSettings.getTextHorAlign(),
                        textWidth: this.visualSettings.textSettings.getTextWidth(),
                        textSize: this.visualSettings.textSettings.getTextSize(),
                        fontFamily: this.visualSettings.textSettings.getFontFamily(),
                        boldText: this.visualSettings.textSettings.getBoldText()
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
                        hoverText: this.visualSettings.textSettings.getText("hover"),
                        hoverTextColor: this.visualSettings.textSettings.getTextColor("hover"),
                        hoverTextPadding: this.visualSettings.textSettings.getPadding("hover"),
                        hoverTextLocation: this.visualSettings.textSettings.getTextLocation("hover"),
                        hoverVerticalAlignment: this.visualSettings.textSettings.getTextVertAlign("hover"),
                        hoverHorTextAlign: this.visualSettings.textSettings.getTextHorAlign("hover"),
                        hoverTextWidth: this.visualSettings.textSettings.getTextWidth("hover"),
                        fontSize: this.visualSettings.textSettings.getTextSize("hover"),
                        hoverFontFamily: this.visualSettings.textSettings.getFontFamily("hover"),
                        hoverBoldText: this.visualSettings.textSettings.getBoldText("hover")
                    },
                    selector: null
                });
            break;
        }
        return objectEnumeration;
    }
}