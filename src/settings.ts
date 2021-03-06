"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
import powerbi from "powerbi-visuals-api";

export class VisualSettings extends DataViewObjectsParser {
      //public dataPoint: dataPointSettings = new dataPointSettings();
      public iconSettings: iconSettings = new iconSettings();
      public textSettings: textSettings = new textSettings();
      public actionSettings: actionSettings = new actionSettings();
      }

     export class iconSettings{       
       public iconColor: powerbi.Fill = { solid: { color: '#000' } };
       public iconFamily: string = "Buildings";
       public iconBuildings: string = "ancient-gate-fill";
       public iconBusiness: string = "advertisement-fill";
       public iconCommunication: string = "chat-1-fill";
       public iconDesign: string = "anticlockwise-2-fill";
       public iconDevelopment: string = "braces-fill";
       public iconDevice: string = "airplay-fill";
       public iconDocument: string = "article-fill";
       public iconEditor: string = "a-b";
       public iconFinance: string = "24-hours-fill";
       public iconHealth: string = "capsule-fill";
       public iconLogos: string = "alipay-fill";
       public iconMap: string = "anchor-fill";
       public iconMedia: string = "4k-fill";
       public iconOthers: string = "basketball-fill";
       public iconSystem: string = "add-box-fill";
       public iconUser: string = "account-box-fill";
       public iconWeather: string = "blaze-fill";
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
