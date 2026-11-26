/* TikNation Enchanted Marks — safe renderer. Never assign a badge from client-side identity claims. */
(function(){
 "use strict";
 const definitions={
  "verified-creator":{label:"Verified Creator",icon:"verified-creator.svg"},
  "iconic-verified":{label:"Iconic Verified",icon:"iconic-verified.svg",description:"Authentic public figure or celebrity account."},
  official:{label:"Official",icon:"official.svg"},
  founder:{label:"Founder",icon:"founder.svg"},
  recognition:{label:"Creator Recognition",icon:"recognition.svg"},
  "beta-pioneer":{label:"Beta Pioneer",icon:"beta-pioneer.svg",description:"I helped shape TikNation before launch."}
 };
 function render(type){
  const item=definitions[type];if(!item)return "";
  const wrap=document.createElement("span");
  wrap.className="tn-badge tn-badge--"+type;
  wrap.setAttribute("role","img");
  wrap.setAttribute("aria-label",item.label);
  wrap.title=item.description||item.label;
  wrap.setAttribute("tabindex","0");
  const img=document.createElement("img");
  img.className="tn-badge__icon";
  img.src="./assets/badges/"+item.icon;
  img.alt="";
  img.width=24;img.height=24;img.decoding="async";
  const label=document.createElement("span");
  label.className="tn-badge__label";label.textContent=item.label;
  wrap.append(img,label);
  return wrap;
 }
 function mount(root){
  (root||document).querySelectorAll("[data-tn-badge]").forEach(slot=>{
   const type=slot.getAttribute("data-tn-badge");
   if(slot.dataset.tnBadgeMounted==="true")return;
   const badge=render(type);if(!badge)return;
   slot.appendChild(badge);slot.dataset.tnBadgeMounted="true";
  });
 }
 window.TikNationBadges=Object.freeze({render,mount,types:Object.freeze(Object.keys(definitions))});
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>mount());
 else mount();
})();
