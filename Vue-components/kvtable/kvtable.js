/*
 * kvtable.js v0.1
 * Copyright 47rooks.com 2017
 * Release under MIT License.
 *
 * Timer requires Vue.js to be loaded before it.
 */
 Vue.component('f7-kvtable', {
   template: `
     <div>
       <h3> {{heading}} </h3>
       <table id="kvTable">
         <tr v-for="elt in kv">
           <td> {{elt.k}} </td>
           <td> {{elt.v}} </td>
         </tr>
       </table>
     </div>`,
   data: function() {
     return {
       heading: null,
       kv: [],
     }
   },
   methods: {
     set: function(kvData) {
       this.heading = kvData.heading;
       this.kv = kvData.kv;
     }
   }
 });
