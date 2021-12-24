firebase.auth().onAuthStateChanged(e=>{e?new a(e).setup():window.location.href="./index.html"});const s={VIEW:1,UPDATE:2,CREATE:3},t={DAY:1,WEEK:2};class a{constructor(e){this.user=e,this.collection=db.collection(this.user.uid),this.mode=s.VIEW,this.display=t.WEEK,this.weekOffset=0,this.slotHeight=30,this.weekStart=null,this.weekEnd=null,this.listener=null,this.currentDayIndex=c(new Date)}setup(){this.detectDisplay(),this.showEmail(),this.setupTimes(),this.setupDays(),this.calculateCurrentWeek(),this.showWeek(),this.setupControls(),this.listenForUpdates()}detectDisplay(){window.innerWidth<900&&this.switchToDayDisplay(),$("#calendar").fadeIn()}showEmail(){$("#emailDisplay").text(this.user.email)}setupTimes(){for(let e=0;e<24;e++){var t=$("<div></div>").attr("data-hour",e).addClass("time").appendTo(".dayTime");0<e&&$("<span></span>").text(e+":00").appendTo(t)}$("#calendar").scrollTop(7*this.slotHeight)}setupDays(){const s=this;$(".day").each(function(){const t=$(this),a=parseInt(t.attr("data-dayIndex"));$("<div></div>").addClass("allDaySection").appendTo(t);for(let e=0;e<24;e++)$("<div></div>").attr("data-hour",e).appendTo(t).addClass("slot").on("click",()=>s.clickSlot(e,a)).hover(()=>s.hoverOver(e),()=>s.hoverOut())})}changeDay(e){this.display!=t.WEEK&&($(".day, .columnHeader").removeClass("current"),this.currentDayIndex+=e,this.currentDayIndex<0?(this.changeWeek(-1),this.currentDayIndex=6):7<=this.currentDayIndex&&(this.changeWeek(1),this.currentDayIndex=0),$(`.day[data-dayIndex="${this.currentDayIndex}"`).addClass("current"),$(`.columnHeader[data-dayIndex="${this.currentDayIndex}"`).addClass("current"))}calculateCurrentWeek(){var e=new Date;this.weekStart=o(e,-c(e)),this.weekEnd=o(this.weekStart,6)}showWeek(){var e={month:"2-digit",day:"2-digit",year:"numeric"};$("#weekStartDisplay").text(this.weekStart.toLocaleDateString(void 0,e)),$("#weekEndDisplay").text(this.weekEnd.toLocaleDateString(void 0,e));for(let e=0;e<7;e++){const a=o(this.weekStart,e);var t=a.toLocaleDateString(void 0,{month:"2-digit",day:"2-digit"});$(`.columnHeader[data-dayIndex=${e}] .date`).text(t)}0==this.weekOffset?this.showCurrentDay():this.hideCurrentDay()}setupControls(){$("#nextWeekBtn").click(()=>this.changeWeek(1)),$("#prevWeekBtn").click(()=>this.changeWeek(-1)),$("#addButton").click(()=>this.addNewEvent()),$("#trashButton").click(()=>this.trash()),$("#cancelButton").click(()=>this.closeModal()),$(".color").click(this.changeColor),$("#logoutButton").click(()=>this.logout()),$("#displayButton").click(()=>this.toggleDisplay()),$(".columnHeader .fa-chevron-right").click(()=>this.changeDay(1)),$(".columnHeader .fa-chevron-left").click(()=>this.changeDay(-1)),$("#allDayCheckBox").change(()=>this.toggleTimes())}toggleTimes(){$("#timeLabel").toggle(),$("#timeInputs").toggle()}logout(){firebase.auth().signOut().then(()=>{window.location.href="./index.html"}).catch(e=>{window.alert(e.message)})}toggleDisplay(){$("#displayButton").toggleClass("fa-calendar-day").toggleClass("fa-calendar-week"),$("#calendar").toggleClass("singleDay"),this.display==t.WEEK?this.switchToDayDisplay():this.switchToWeekDisplay()}switchToDayDisplay(){this.display=t.DAY,$("#calendar").addClass("singleDay"),$("#displayButton").removeClass("fa-calendar-week").addClass("fa-calendar-day"),$("#displayButton").attr("title","Change to week view"),$(`.day[data-dayIndex="${this.currentDayIndex}"`).addClass("current"),$(`.columnHeader[data-dayIndex="${this.currentDayIndex}"`).addClass("current")}switchToWeekDisplay(){this.display=t.WEEK,$("#calendar").removeClass("singleDay"),$("#displayButton").removeClass("fa-calendar-day").addClass("fa-calendar-week"),$("#displayButton").attr("title","Change to day view"),$(".day, .columnHeader").removeClass("current")}changeWeek(e){this.weekOffset+=e,this.weekStart=o(this.weekStart,7*e),this.weekEnd=o(this.weekEnd,7*e),this.showWeek(),this.listener&&this.listener(),this.listenForUpdates()}showCurrentDay(){var e=c(new Date);$(`.columnHeader[data-dayIndex=${e}]`).addClass("currentDay")}hideCurrentDay(){$(".columnHeader").removeClass("currentDay")}hoverOver(e){$(`.time[data-hour=${e}]`).addClass("currentTime")}hoverOut(){$(".time").removeClass("currentTime")}clickSlot(e,t){var a;this.mode==s.VIEW&&(this.mode=s.CREATE,a=e.toString().padStart(2,"0")+":00",e=e<23?(e+1).toString().padStart(2,"0")+":00":e.toString().padStart(2,"0")+":59",t=n(o(this.weekStart,t)),this.openModal({start:a,end:e,date:t,title:"",description:"",color:"red",allDay:!1}))}changeColor(){$(".color").removeClass("active"),$(this).addClass("active")}openModal(t){$("#modalTitle").text(this.mode==s.UPDATE?"Update your event":"Create a new event"),$("#eventTitle").val(t.title),$("#eventDate").val(t.date),$("#eventStart").val(t.start),$("#eventEnd").val(t.end),$("#eventDescription").val(t.description),$("#allDayCheckBox").prop("checked",t.allDay),t.allDay?$("#timeLabel, #timeInputs").hide():$("#timeLabel, #timeInputs").show(),$(".color").removeClass("active"),$(`.color[data-color=${t.color}]`).addClass("active"),this.mode==s.UPDATE?($("#submitButton").val("Update"),$("#deleteButton").show().off("click").click(()=>this.delete(t)),$("#copyButton").show().off("click").click(()=>this.copy(t))):this.mode==s.CREATE&&($("#submitButton").val("Create"),$("#deleteButton, #copyButton").hide()),$("#modalContainer").fadeIn(200).css("display","flex"),$("#eventModal").off("submit").submit(e=>{e.preventDefault(),this.submitModal(t)})}closeModal(){$("#modalContainer").fadeOut(200),$("#errors").text(""),this.mode=s.VIEW}async submitModal(e){await this.validate(e)&&(this.mode==s.CREATE?await this.create(e):this.mode==s.UPDATE&&await this.update(e))}async create(e){this.read(e);try{var t=await this.collection.add(e);e.id=t.id,this.closeModal()}catch(e){$("#errors").text(e.message)}}async update(e){this.read(e);try{await this.collection.doc(e.id).update({title:e.title,start:e.start,end:e.end,date:e.date,description:e.description,color:e.color,allDay:e.allDay}),this.closeModal()}catch(e){$("#errors").text(e.message)}}read(e){e.title=$("#eventTitle").val(),e.start=$("#eventStart").val(),e.end=$("#eventEnd").val(),e.date=$("#eventDate").val(),e.description=$("#eventDescription").val(),e.allDay=$("#allDayCheckBox").prop("checked"),e.color=$(".color.active").attr("data-color")}async delete(e){if(window.confirm("Do you really want to delete this event?"))try{await this.collection.doc(e.id).delete(),$("#"+e.id).remove(),this.closeModal()}catch(e){$("#errors").text(e.message)}}copy(e){this.mode==s.UPDATE&&(this.closeModal(),this.mode=s.CREATE,e={title:"Copy of "+e.title,start:e.start,end:e.end,date:e.date,description:e.description,color:e.color,allDay:e.allDay},this.openModal(e))}addNewEvent(){var e;this.mode==s.VIEW&&(this.mode=s.CREATE,e=this.display==t.DAY?this.currentDayIndex:0,e={start:"12:00",end:"13:00",date:n(o(this.weekStart,e)),title:"",description:"",color:"red",allDay:!1},this.openModal(e))}listenForUpdates(){this.listener=this.collection.where("date",">=",n(this.weekStart)).where("date","<=",n(this.weekEnd)).onSnapshot(e=>{$(".event").remove(),e.forEach(e=>{const t=e.data();t.id=e.id,this.show(t)})})}show(t){if(t.date<n(this.weekStart)||t.date>n(this.weekEnd))$("#"+t.id).remove();else{let e;e=$("#"+t.id).length?$("#"+t.id):$("<div></div>").addClass("event").attr("id",t.id).click(()=>this.click(t));var a,s,i,o,l,r=this.slotHeight,d=c(new Date(t.date));t.allDay?e.addClass("allDay").text(t.title).css("backgroundColor",`var(--color-${t.color})`).appendTo(`.columnHeader[data-dayIndex=${d}] .allDaySection`):(a=parseInt(t.start.substring(0,2)),s=parseInt(t.end.substring(0,2)),i=parseInt(t.start.substring(3,5)),o=parseInt(t.end.substring(3,5)),l=(new Date(t.date+"T"+t.end).getTime()-new Date(t.date+"T"+t.start).getTime())/6e4,e.removeClass("allDay").text(t.title).css("top",(a+i/60)*r+1+"px").css("bottom",24*r-(s+o/60)*r+2+"px").css("backgroundColor",`var(--color-${t.color})`).appendTo(`.day[data-dayIndex=${d}]`),l<45?e.removeClass("shortEvent").addClass("veryShortEvent"):l<59?e.removeClass("veryShortEvent").addClass("shortEvent"):e.removeClass("shortEvent").removeClass("veryShortEvent"))}}click(e){this.mode==s.VIEW&&(this.mode=s.UPDATE,this.openModal(e))}async validate(s){if(s.allDay)return!0;const i=$("#eventStart").val(),o=$("#eventEnd").val();var e=$("#eventDate").val();if(i!=s.start||o!=s.end||e!=s.date){const t=await this.collection.where("date","==",e).get();let a=null;if(t.forEach(e=>{var t=e.id,e=e.data();!e.allDay&&t!=s.id&&e.end>i&&e.start<o&&(a=e)}),a)return $("#errors").text(`This collides with the event '${a.title}'`+`(${a.start} - ${a.end}).`),!1}e=(new Date(e+"T"+o).getTime()-new Date(e+"T"+i).getTime())/6e4;return e<0?($("#errors").text("The start cannot be after the end."),!1):!(e<30)||($("#errors").text("Events should be at least 30 minutes."),!1)}async trash(){if(this.mode==s.VIEW&&window.confirm("This will delete all the events in your calendar!\nThis cannot be undone. Are you sure?"))try{const e=await this.collection.get();e.forEach(e=>{this.collection.doc(e.id).delete(),$("#"+e.id).remove()})}catch(e){window.alert(e.message)}}}function n(e){return`${e.getFullYear()}-${(e.getMonth()+1).toString().padStart(2,"0")}-`+e.getDate().toString().padStart(2,"0")}function c(e){e=e.getDay();return 0==e?6:e-1}const i=864e5;function o(e,t){return new Date(e.getTime()+t*i)}
//# sourceMappingURL=calendar.js.map
