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
import VisualEnumerationInstanceKinds = powerbi.VisualEnumerationInstanceKinds;

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
    private events: IVisualEventService;
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
    private textY: number;
    private iconX: number;
    private iconY: number;
    private textBoxContainer: HTMLElement;
    private textBox: HTMLElement;
    private svgContainer: HTMLElement;
    private svg: Selection<SVGElement>;

    private icon_name: string;


    constructor(visualOptions: VisualConstructorOptions) {
        // Set up options
        this.target = visualOptions.element;
        this.wasClicked = false;
        this.updateCount = 0;
        this.host = visualOptions.host;

        // Set up text box
        this.textBoxContainer = document.createElement('div');
        this.textBox = document.createElement('div');
        this.textBoxContainer.appendChild(this.textBox);
        this.target.appendChild(this.textBoxContainer);
        this.textBoxContainer.style.position = 'absolute';
        this.textBox.style.position = 'absolute';

        // Set up SVG container
        this.svgContainer = document.createElement('div');
        this.target.appendChild(this.svgContainer);
        this.svgContainer.style.position = 'absolute';

        // Set up SVG
        this.svg = d3.select(this.svgContainer).append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('viewBox', '0 0 24 24');

        // Set up events
        this.events = visualOptions.host.eventService;
        this.target.onmouseover = () => {
            this.handleMouseOver(true);
        };
        this.target.onmouseout = () => {
            this.handleMouseOver(false);
        };
        
    }

    

    public handleMouseOver(isMouseOver: boolean) {
        if (isMouseOver) {
            this.textBox.textContent = this.visualSettings.textSettings.getHoverText();
            this.textBox.style.padding = this.visualSettings.textSettings.getHoverPadding().toString() + "px";
            this.textBox.style.fontFamily = this.visualSettings.textSettings.getHoverFontFamily();
            this.textBox.style.fontWeight = (this.visualSettings.textSettings.getHoverBold()) ? "Bold" : "normal";
            this.textBox.style.fontSize = this.visualSettings.textSettings.getHoverTextSize() + "pt";
        }
        else {
            this.textBox.style.color = this.visualSettings.textSettings.defaultTextColor.toString();
            this.textBox.textContent = this.visualSettings.textSettings.text;
            this.textBox.style.padding = this.visualSettings.textSettings.textPadding + "px";
            this.textBox.style.fontFamily = this.visualSettings.textSettings.fontFamily;
            this.textBox.style.fontWeight = (this.visualSettings.textSettings.boldText) ? "Bold" : "normal";
            this.textBox.style.fontSize = this.visualSettings.textSettings.textSize + "pt";
        }
        this.positionTextBox();
    }
    public update(options: VisualUpdateOptions) {

        console.log("1");

        this.events.renderingStarted(options);
        console.log("2");

        this.updateOptions = options;
        let dataView: DataView = options.dataViews[0];
        this.visualSettings = Visual.parseSettings(dataView);
        console.log("3");

        let cellValue: string = "";
        if(dataView.table && dataView.table.rows.length > 0 && dataView.table.columns.length > 0)
        {
            const row = dataView.table.rows[0];
            const column = dataView.table.columns[0];
            cellValue = row[column.index]?.toString() ?? "";
        }

        console.log("4");

        console.log(cellValue);
        this.icon_name = cellValue;


        this.drawVisual(this.visualSettings.iconSettings.iconFamily);
        this.events.renderingFinished(options);
    }
    
    private drawVisual(iconFamily: string) {
        //first set the textbox style properties and text value
        if (this.visualSettings.textSettings.show)
            this.drawTextBox();
        else {
            this.textBoxContainer.style.display = "none";
            this.textBoxContainer.style.width = "0px";
            this.textBoxContainer.style.height = "0px";
        }
        this.drawIcon();
    }
    private drawIcon() {
        //set width and height
        if (this.visualSettings.textSettings.textLocation == "left" || this.visualSettings.textSettings.textLocation == "right") {
            this.svgContainer.style.width = (this.target.offsetWidth - this.textBoxContainer.offsetWidth).toString() + "px";
            this.svgContainer.style.height = "100%";
        }
        else {
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

        //if UseIconNameMeasure

        if(this.visualSettings.iconSettings.getActiveIconName() == "UseIconNameMeasure")
        {
            this.svg.html(iconLibrary.get(this.icon_name));

        }
        else
        {
            this.svg.html(iconLibrary.get(this.visualSettings.iconSettings.getActiveIconName()));

        }


        this.svg.style('width', "100%");
        this.svg.style('height', "100%");
        this.svg.style('fill', this.visualSettings.iconSettings.iconColor.toString());
    }
    private drawTextBox() {
        this.textBoxContainer.style.display = "block";
        this.textBox.textContent = this.visualSettings.textSettings.text;
        this.textBox.style.color = this.visualSettings.textSettings.defaultTextColor.toString();
        this.textBox.style.fontFamily = this.visualSettings.textSettings.fontFamily;
        this.textBox.style.fontSize = this.visualSettings.textSettings.textSize + "pt";
        this.textBox.style.fontWeight = (this.visualSettings.textSettings.boldText) ? "Bold" : "normal";
        this.textBox.style.textAlign = this.visualSettings.textSettings.horTextAlign;
        this.textBox.style.padding = this.visualSettings.textSettings.textPadding + "px";
        this.positionTextBox();
    }

    private positionTextBox() {
        this.textBoxContainer.style.left = (this.visualSettings.textSettings.textLocation == "left") ? "0px" : "";
        this.textBoxContainer.style.right = (this.visualSettings.textSettings.textLocation == "right") ? "0px" : "";
        this.textBoxContainer.style.top = (this.visualSettings.textSettings.textLocation == "top") ? "0px" : "";
        this.textBoxContainer.style.bottom = (this.visualSettings.textSettings.textLocation == "bottom") ? "0px" : "";
        if (this.visualSettings.textSettings.textLocation == "left" || this.visualSettings.textSettings.textLocation == "right") {
            this.textBoxContainer.style.width = this.visualSettings.textSettings.textWidth.toString() + "%"
            this.textBoxContainer.style.height = "100%";
            this.textBox.style.width = (this.textBoxContainer.offsetWidth - (2 * this.visualSettings.textSettings.textPadding)).toString() + "px";
        }
        else {
            this.textBoxContainer.style.width = "100%";
            this.textBoxContainer.style.height = "";
            this.textBox.style.width = ((this.visualSettings.textSettings.textWidth / 100) * this.textBoxContainer.offsetWidth - (2 * this.visualSettings.textSettings.textPadding)).toString() + "px";
        }
        if (this.textBoxContainer.offsetHeight < this.textBox.offsetHeight) this.textBoxContainer.style.height = this.textBox.offsetHeight.toString() + "px";
        if (this.visualSettings.textSettings.verticalAlignment == "top") {
            this.textBox.style.top = "0px";
            this.textBox.style.bottom = "";
        }
        if (this.visualSettings.textSettings.verticalAlignment == "middle") {
            this.textBox.style.top = ((this.textBoxContainer.offsetHeight - this.textBox.offsetHeight) / 2).toString() + "px";
            this.textBox.style.bottom = "";
        }
        if (this.visualSettings.textSettings.verticalAlignment == "bottom") {
            this.textBox.style.top = "";
            this.textBox.style.bottom = "0px";
        }
        if (this.visualSettings.textSettings.horTextAlign == "left") {
            this.textBox.style.left = "0px";
            this.textBox.style.right = "";
        }
        if (this.visualSettings.textSettings.horTextAlign == "center") {
            this.textBox.style.left = ((this.textBoxContainer.offsetWidth - this.textBox.offsetWidth) / 2).toString() + "px";
            this.textBox.style.right = "";
        }
        if (this.visualSettings.textSettings.horTextAlign == "right") {
            this.textBox.style.left = "";
            this.textBox.style.right = "0px";
        }
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        var settings: VisualSettings = <VisualSettings>VisualSettings.parse(dataView);
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
    private enumerateIconSettings(): VisualObjectInstance[] {
        const { iconSettings } = this.visualSettings;
        const objectEnumeration: VisualObjectInstance[] = [
            {
                objectName: "iconSettings",
                properties: {
                    iconFamily: iconSettings.iconFamily
                },
                selector: null,
                propertyInstanceKind: {
                    noDataMessage:
                        VisualEnumerationInstanceKinds.ConstantOrRule
                }
            },
            {
                objectName: "iconColor",
                properties: {
                    iconColor: {
                        solid: {
                            color: iconSettings.iconColor
                        }
                    }
                },
                selector: null,
                propertyInstanceKind: {
                    iconColor: VisualEnumerationInstanceKinds.ConstantOrRule
                }
            }
        ];

        const iconFamily = iconSettings.iconFamily;
        if (iconFamily) {
            objectEnumeration.push({
                objectName: "iconSettings",
                properties: {
                    [`icon${iconFamily}`]: iconSettings[`icon${iconFamily}`]
                },
                selector: null
            });
        }

        return objectEnumeration;
    }

    private enumerateTextSettings(): VisualObjectInstance[] {
        // Destructure textSettings and controlState from this.visualSettings
        const { textSettings } = this.visualSettings;
        const { controlState } = textSettings;

        // Create a properties object with the common properties for both controlState cases
        const properties = {
            show: textSettings.show,
            controlState,
            textWidth: textSettings.textWidth,
            verticalAlignment: textSettings.verticalAlignment,
            horTextAlign: textSettings.horTextAlign,
            textLocation: textSettings.textLocation
        };

        // Add the specific properties for each controlState case using Object.assign()
        switch (controlState) {
            case 'default':
                Object.assign(properties, {
                    text: textSettings.text,
                    defaultTextColor: textSettings.defaultTextColor,
                    textPadding: textSettings.textPadding,
                    textSize: textSettings.textSize,
                    fontFamily: textSettings.fontFamily,
                    boldText: textSettings.boldText
                });
                break;
            case 'onhover':
                Object.assign(properties, {
                    hoverText: textSettings.getHoverText(),
                    hoverTextColor: textSettings.getHoverColor(),
                    hoverTextPadding: textSettings.getHoverPadding(),
                    fontSize: textSettings.getHoverTextSize(),
                    hoverFontFamily: textSettings.getHoverFontFamily(),
                    hoverBoldText: textSettings.getHoverBold()
                });
                break;
        }

        // Return an array with a single object containing the properties and objectName
        return [{
            objectName: 'textSettings',
            properties,
            selector: null
        }];
    }
}