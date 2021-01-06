"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import * as icondata from "./icondata";
import powerbi from "powerbi-visuals-api";

export class VisualSettings extends DataViewObjectsParser {
      //public dataPoint: dataPointSettings = new dataPointSettings();
      public iconSettings: iconSettings = new iconSettings();
      public textSettings: textSettings = new textSettings();
      public actionSettings: actionSettings = new actionSettings();
      }

     export class iconSettings{       
       public iconColor: string = '#000000';
       public iconFamily: string = "Buildings";
       public iconBuildings: string = "no selection";
       public iconBusiness: string = "no selection";
       public iconCommunication: string = "no selection";
       public iconDesign: string = "no selection";
       public iconDevelopment: string = "no selection";
       public iconDevice: string = "no selection";
       public iconDocument: string = "no selection";
       public iconEditor: string = "no selection";
       public iconFinance: string = "no selection";
       public iconHealth: string = "no selection";
       public iconLogos: string = "no selection";
       public iconMap: string = "no selection";
       public iconMedia: string = "no selection";
       public iconOthers: string = "no selection";
       public iconSystem: string = "no selection";
       public iconUser: string = "no selection";
       public iconWeather: string = "no selection";
       public getActiveIconName():string{
        switch (this.iconFamily){
        case "Buildings":
          return this.iconBuildings;
          case "Business":
            return this.iconBusiness;
          case "Communication":
            return this.iconCommunication;
          case "Design":
            return this.iconDesign;
          case "Development":
            return this.iconDevelopment;
          case "Device":
            return this.iconDevice;
          case "Document":
            return this.iconDocument;
          case "Editor":
            return this.iconEditor;
          case "Finance":
            return this.iconFinance;
          case "Health":
            return this.iconHealth;
          case "Logos":
            return this.iconLogos;
          case "Map":
            return this.iconMap;
          case "Media":
            return this.iconMedia;
          case "Others":
            return this.iconOthers;
          case "System":
            return this.iconSystem;
          case "User":
            return this.iconUser;
          case "Weather":
            return this.iconWeather;
      }
       }
       public getActiveIconMap():Map<string,string>{
        switch (this.iconFamily){
        case "Buildings":
          return icondata.iconLibraryBuildings;
          case "Business":
            return icondata.iconLibraryBusiness;
          case "Communication":
            return icondata.iconLibraryCommunication;
          case "Design":
            return icondata.iconLibraryDesign;
          case "Development":
            return icondata.iconLibraryDevelopment;
          case "Device":
            return icondata.iconLibraryDevice;
          case "Document":
            return icondata.iconLibraryDocument;
          case "Editor":
            return icondata.iconLibraryEditor;
          case "Finance":
            return icondata.iconLibraryFinance;
          case "Health":
            return icondata.iconLibraryHealth;
          case "Logos":
            return icondata.iconLibraryLogos;
          case "Map":
            return icondata.iconLibraryMap;
          case "Media":
            return icondata.iconLibraryMedia;
          case "Others":
            return icondata.iconLibraryOthers;
          case "System":
            return icondata.iconLibrarySystem;
          case "User":
            return icondata.iconLibraryUser;
          case "Weather":
            return icondata.iconLibraryWeather;
      }
       }
     }
     export class actionSettings{
      public show:boolean = false;
      public url: string = "";
     }
    export class textSettings{
      public show:boolean = false;
      public textLocation: string = "top";
      public verticalAlignment: string = "top";
      public horTextAlign: string = "left";
      public textWidth:number = 50;
      public textSize: number = 12;
      public fontSize: number = null;
      public defaultTextColor: powerbi.Fill = { solid: { color: '#000' } };
      public hoverTextColor: powerbi.Fill = null;
      public fontFamily: string =  "Arial";
      public hoverFontFamily: string =  null;
      public boldText: boolean = false;
      public hoverBoldText: boolean = null;
      public textPadding:number=0;
      public hoverTextPadding:number = null;
      public text:string="";
      public hoverText:string=null;
      public controlState:string="default";
      public getHoverColor():powerbi.Fill{
        return (this.hoverTextColor == null)?this.defaultTextColor:this.hoverTextColor;
      }
      public getHoverText():string{
          return (this.hoverText == null)?this.text:this.hoverText;
      }
      public getHoverPadding():number{
          return (this.hoverTextPadding == null)?this.textPadding:this.hoverTextPadding;
      } 
      public getHoverTextSize():number{
          return (this.fontSize == null)?this.textSize:this.fontSize;
      } 
      public getHoverFontFamily():string{
          return (this.hoverFontFamily == null)?this.fontFamily:this.hoverFontFamily;
      } 
      public getHoverBold():boolean{
          return (this.hoverBoldText == null)?this.boldText:this.hoverBoldText;
      } 
    }
