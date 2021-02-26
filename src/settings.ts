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
       private iconColor: string = '#000000' ;
       private iconHoverColor: string = null;
       public iconLibrary: string = "remix";
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
       public controlState:string="default";

       public getIconColor(state:string="default"){
        switch (state){
          case "default":
            return this.iconColor;
          case "hover":
            return this.getHoverColor();
        }}
       private getHoverColor():string{
        return (this.iconHoverColor == null)?this.iconColor:this.iconHoverColor;
      }

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
      private textLocation: string = "top";
      private hoverTextLocation: string = null;
      private verticalAlignment: string = "top";
      private hoverVerticalAlignment: string = null;
      private horTextAlign: string = "left";
      private hoverHorTextAlign: string = null;
      private textWidth:number = 50;
      private hoverTextWidth:number = null;
      private textSize: number = 12;
      private fontSize: number = null;//this is for hover state the naming is changed to utilize the built in font size control
      private defaultTextColor: powerbi.Fill = { solid: { color: '#000' } };
      private hoverTextColor: powerbi.Fill = null;
      private fontFamily: string =  "Arial";
      private hoverFontFamily: string =  null;
      private boldText: boolean = false;
      private hoverBoldText: boolean = null;
      private textPadding:number=0;
      private hoverTextPadding:number = null;
      private text:string="";
      private hoverText:string=null;
      public controlState:string="default";

      public getTextLocation(state:string="default"){
        switch (state){
          case "default":
            return this.textLocation;
          case "hover":
            return this.getHoverTextLocation();
        }}
        public getTextVertAlign(state:string="default"){
          switch (state){
            case "default":
              return this.verticalAlignment;
            case "hover":
              return this.getHoverVerticalAlignment();
          }}
        public getTextHorAlign(state:string="default"){
          switch (state){
            case "default":
              return this.horTextAlign;
            case "hover":
              return this.getHoverHorizontalAlignment();
          }}
        public getTextWidth(state:string="default"){
          switch (state){
            case "default":
              return this.textWidth;
            case "hover":
              return this.getHoverTextWidth();
          }}
        public getTextSize(state:string="default"){
          switch (state){
            case "default":
              return this.textSize;
            case "hover":
              return this.getHoverTextSize();
          }}
      public getTextColor(state:string="default"){
        switch (state){
          case "default":
            return this.defaultTextColor;
          case "hover":
            return this.getHoverColor();
        }}
        public getFontFamily(state:string="default"){
          switch (state){
            case "default":
              return this.fontFamily;
            case "hover":
              return this.getHoverFontFamily();
          }}
        public getBoldText(state:string="default"){
          switch (state){
            case "default":
              return this.boldText;
            case "hover":
              return this.getHoverBold();
          }}
        public getPadding(state:string="default"){
          switch (state){
            case "default":
              return this.textPadding;
            case "hover":
              return this.getHoverPadding();
          }}
        public getText(state:string="default"){
          switch (state){
            case "default":
              return this.text;
            case "hover":
              return this.getHoverText();
          }}
      private getHoverColor():powerbi.Fill{
        return (this.hoverTextColor == null)?this.defaultTextColor:this.hoverTextColor;
      }
      private getHoverText():string{
          return (this.hoverText == null)?this.text:this.hoverText;
      }
      private getHoverPadding():number{
          return (this.hoverTextPadding == null)?this.textPadding:this.hoverTextPadding;
      } 
      private getHoverTextSize():number{
          return (this.fontSize == null)?this.textSize:this.fontSize;
      } 
      private getHoverFontFamily():string{
          return (this.hoverFontFamily == null)?this.fontFamily:this.hoverFontFamily;
      } 
      private getHoverBold():boolean{
          return (this.hoverBoldText == null)?this.boldText:this.hoverBoldText;
      } 
      private getHoverTextLocation():string{
          return (this.hoverTextLocation == null)?this.textLocation:this.hoverTextLocation;
      }
      private getHoverVerticalAlignment():string{
          return (this.hoverVerticalAlignment == null)?this.verticalAlignment:this.hoverVerticalAlignment;
      }
      private getHoverHorizontalAlignment():string{
          return (this.hoverHorTextAlign == null)?this.horTextAlign:this.hoverHorTextAlign;
      }
      private getHoverTextWidth():number{
          return (this.hoverTextWidth == null)?this.textWidth:this.hoverTextWidth;
      } 
    }
