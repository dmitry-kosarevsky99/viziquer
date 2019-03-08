Interpreter.customMethods({
	
	setParameters: function(list) {

		console.log("SetParametrs called, not implemented");
	},

	Test: function() {
		//Utilities.callMeteorMethod("migrateIndexes",Session.get("activeProject"));
        var proj_id = Session.get("activeProject");
		var act_elem_id = Session.get("activeElement"); 
		console.log(proj_id);
		var elem = Elements.findOne({_id: act_elem_id,})
		var elem_type = ElementTypes.findOne({_id: elem.elementTypeId,});
		CompartmentTypes.find({elementTypeId:elem_type._id}).forEach(function(compType){
			compartments = Compartments.find({projectId:proj_id, elementId:act_elem_id, compartmentTypeId:compType._id });
				comp_ind = compartments.map(function (c) {
				   return {_id:c._id, index:c.index, input:c.input};
				});
				if (compartments.count() > 0 )
				{
				  console.log(compType.name);
				  console.log(compType.index);
				  console.log(comp_ind);
				}
		});
	},

	VQsetGroupBy: function() {
		 var act_elem = Session.get("activeElement");
		 var elem = new VQ_Element(act_elem);
		 comp_val_inst = elem.getCompartmentValue("Instance");
		 comp_val_group = elem.getCompartmentValue("Group by this");
 		 if (comp_val_group == "true")
		 {
		   if (comp_val_inst == null )
		     elem.setCompartmentValue("Instance", "", "{group}");
		   else
		     elem.setCompartmentValue("Instance", comp_val_inst, "{group} " + comp_val_inst , false);
		 }
		 else
		 {
		   if (typeof comp_val_inst == "undefined")
		     elem.setCompartmentValue("Instance", "", "", false);
		   else if ( comp_val_inst != null)
		     elem.setCompartmentValue("Instance", comp_val_inst, comp_val_inst, false);
		 }
 	},

	TogglePlainMode: function() {

		var plain = Session.get("plain");
		if (plain.showDiagram == "none") {
			_.extend(plain, {showPlain: "none", showDiagram: "inline",});
		}

		else {
			_.extend(plain, {showPlain: "inline", showDiagram: "none",});
		}

		Session.set("plain", plain);
	},

	TestPr: function() {

		var schema = new VQ_Schema();
  		//console.log(schema);
		//console.log(schema.findClassByName("Course").getAllAssociations());
		//console.log(schema.findClassByName("Student").getAllAttributes());
		//console.log(schema.getAllClasses());
		//console.log(schema.findClassByName("Teacher3"));
		//console.log(schema.resolveClassByName("Teacher3"));
		//console.log(schema.resolveLinkByName("teaches"));
		//console.log(schema.resolveAttributeByName("Nationality" ,"nCode"));
	},

	VQsetClassTypeValue: function(list) {
		//class->element->extensions->after create elements
	},

	VQsetEnabledFieldsFromClassTypeChange: function() {
		//class->compartments->ClassType->extensions->after update
		//params: (compartType, compartId)
	},
	VQgetClassNames: function() {
		//Class -> compartments->Name->extension->dynamicDropDown
		var schema = new VQ_Schema();
		var cls = schema.getAllClasses();
		var class_names = [];
		if (_.size(cls) > 0) {

			//Create array of needed structure from class' names
			class_names = cls.map(function (c) {
				return {value: c["name"], input: c["name"]};
			});

			class_names = _.sortBy(class_names, "input");

		 	class_names =  _.uniq(class_names, false, function(c) {
		 		return c["input"];
		 	});
	 	};

		class_names.push({input:"[ ]", value:"[ ]"});
		class_names.push({input:"[ + ]", value:"[ + ]"});

		return class_names;

	},

	VQgetClassNamesOld: function() {
		//Class -> compartments->Name->extension->dynamicDropDown
		var cls = Classes.find();

		if (cls.count() > 0) {

			//Create array of needed structure from class' names
			var class_names = cls.map(function (user) {
				return {value: user["name"], input: user["name"],};
			});

			class_names = _.union([{value: " ", input: " ", }], class_names);
			class_names = _.sortBy(class_names, "input");

		 	var is_sorted = false;
		 	return _.uniq(class_names, is_sorted, function(item) {
		 		return item["input"];
		 	});
	 	}

	},

	VQsetInstance: function() {
		//class -> compartments->Name->extension->AfterUpdate
		//params: (compartType, compartId)
	},

	VQsetShowInstanceName: function() {
		//class -> compartments->Instance->extension->AfterUpdate
		//params: (compartType, compartId)
	},

	VQattributeGrammar: function() {
	},

	VQsetIsNegationAttribute: function() {

	console.log("is negations enetered");

	},

	VQsetIsOptionalAttribute: function() {
		console.log("is optional enetered");
	},
  VQgetAggregateNames: function() {

		 var act_elem = Session.get("activeElement");
		 if (!act_elem) {
 			return [];
 		}
 		var act_comp = Compartments.findOne({elementId: act_elem})
 		if (!act_comp) {
 			return [];
 		}

 		var elem_type = ElementTypes.findOne({name: "Class"});
 		if (elem_type && act_comp["elementTypeId"] != elem_type._id) {
 			return [];
 		}

 		//Active element is given as Class type element
 		var atr_names = [];

 		var act_el = Elements.findOne({_id: act_elem}); //Check if element ID is valid

 		if (act_el) {
 		//check if Class name is defined for active element
 			var compart_type = CompartmentTypes.findOne({name: "Name", elementTypeId: act_el["elementTypeId"]});

 			if (!compart_type) {
 				return [{input:"count(.)",value:"count(.)"},{input:"count_distinct(.)",value:"count_distinct(.)"}];
 			}

 			var compart = Compartments.findOne({compartmentTypeId: compart_type["_id"], elementId: act_elem});
 			if (!compart) {
 				return [{input:"count(.)",value:"count(.)"},{input:"count_distinct(.)",value:"count_distinct(.)"}];
 			}

 		//Read attribute values from DB

 			var schema = new VQ_Schema();

 			if (schema.classExist(compart["input"])) {
 				var klass = schema.findClassByName(compart["input"]);

 				_.each(klass.getAllAttributes(), function(att){
 					var att_val = "avg("+att["name"]+")";
 					atr_names.push({value: att_val, input: att_val});
					att_val = "min("+att["name"]+")";
 					atr_names.push({value: att_val, input: att_val});
					att_val = "max("+att["name"]+")";
 					atr_names.push({value: att_val, input: att_val});
					att_val = "sum("+att["name"]+")";
 					atr_names.push({value: att_val, input: att_val});
					att_val = "group_concat("+att["name"]+",',')";
 					atr_names.push({value: att_val, input: att_val});
 				})
 			}



 		}


 	 	// return atr_names;
 		atr_names = _.sortBy(atr_names, "input");

		atr_names = _.union([{input:"count(.)",value:"count(.)"},{input:"count_distinct(.)",value:"count_distinct(.)"}], atr_names);

 	 	atr_names = _.uniq(atr_names, false, function(item) {
 	 		return item["input"];
 	 	});

 		return atr_names;

	},
	VQgetAttributeNames: function() {

		//console.log("VQgetAttributeNames executed");

		//atribute value for class
		var act_elem = Session.get("activeElement");
		//Active element does not exist OR has no Name OR is of an unpropriate type
		if (!act_elem) {
			return [];
		}
		var act_comp = Compartments.findOne({elementId: act_elem})
		if (!act_comp) {
			return [];
		}

		var elem_type = ElementTypes.findOne({name: "Class"});
		if (elem_type && act_comp["elementTypeId"] != elem_type._id) {
			return [];
		}

		//Active element is given as Class type element
		var atr_names = [{value: " ", input: " ", }];

		var act_el = Elements.findOne({_id: act_elem}); //Check if element ID is valid

		if (act_el) {
		//check if Class name is defined for active element
			var compart_type = CompartmentTypes.findOne({name: "Name", elementTypeId: act_el["elementTypeId"]});

			if (!compart_type) {
				return atr_names;
			}

			var compart = Compartments.findOne({compartmentTypeId: compart_type["_id"], elementId: act_elem});
			if (!compart) {
				return atr_names;
			}

		//Read attribute values from DB

			var schema = new VQ_Schema();

			if (schema.classExist(compart["input"])) {
				var klass = schema.findClassByName(compart["input"]);

				_.each(klass.getAllAttributes(), function(att){
					var att_val = att["name"];
					atr_names.push({value: att_val, input: att_val});
				})
			}



		}

		
	 	// return atr_names;
		atr_names = _.sortBy(atr_names, "input");
		
		var selected_elem_id = Session.get("activeElement");
		
		var symbolTable = generateSymbolTable()
		
		for (var  key in symbolTable) {	
			for (var symbol in symbolTable[key]) {
				if(symbolTable[key][symbol]["context"] != selected_elem_id){
					var vq_obj = new VQ_Element(symbolTable[key][symbol]["context"]);
					var links = vq_obj.getLinks();
					for (var assoc in links) {
						if(links[assoc]["link"].isSubQuery() || links[assoc]["link"].isGlobalSubQuery()){
							var association = links[assoc]["link"];
							var isStart = links[assoc]["start"];
							var clazz;
							if(isStart == true) clazz = association.getStartElement();
							else clazz = association.getEndElement();
							if(clazz["obj"]["_id"] == selected_elem_id) atr_names.push({value: key, input: key});
						}
					}
				}
			}	
		}

	 	atr_names = _.uniq(atr_names, false, function(item) {
	 		return item["input"];
	 	});

		
		if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
			var vq_obj = new VQ_Element(selected_elem_id);
			if(vq_obj.isUnion() != true && vq_obj.isUnit() != true) atr_names.push({input:"(select this)",value:"(select this)"});;
		} else {atr_names.push({input:"(select this)",value:"(select this)"});}
				
		atr_names.push({input:"*",value:"*"});
		atr_names.push({input:"(*attr)",value:"(*attr)"});
		atr_names.push({input:"(*sub)",value:"(*sub)"});
		// atr_names.push({input:"**",value:"**"});

		return atr_names;


	},

	VQgetAttributeNamesOld: function() {

		console.log("VQgetAttributeNames executed");

		//atribute value for class
		var act_elem = Session.get("activeElement");
		//Active element does not exist OR has no Name OR is of an unpropriate type
		if (!act_elem) {
			return [];
		}
		var act_comp = Compartments.findOne({elementId: act_elem})
		if (!act_comp) {
			return [];
		}

		var elem_type = ElementTypes.findOne({name: "Class"});
		if (elem_type && act_comp["elementTypeId"] != elem_type._id) {
			return [];
		}

		//Active element is given as Class type element
		var atr_names = [{value: " ", input: " ", }];

		var act_el = Elements.findOne({_id: act_elem}); //Check if element ID is valid

		if (act_el) {
		//check if Class name is defined for active element
			var compart_type = CompartmentTypes.findOne({name: "Name", elementTypeId: act_el["elementTypeId"]});

			if (!compart_type) {
				return atr_names;
			}

			var compart = Compartments.findOne({compartmentTypeId: compart_type["_id"], elementId: act_elem});
			if (!compart) {
				return atr_names;
			}

		//Read attribute values from DB
			//direct
			var klass = Classes.findOne({name: compart["input"]});

			if (!klass) {
				console.error("VQgetAttributeNames: No Classs with such Name");
				return ;
			}

			_.each(klass["Attributes"], function(att){
				var att_val = att["localName"];
				atr_names.push({value: att_val, input: att_val});
			})

			//from Super Class
			_.each(klass["AllSuperClasses"], function(supC){

				var cs_val = supC["localName"];
				var cs_list = Classes.findOne({name: cs_val});

				if (cs_list) {

					_.each(cs_list["Attributes"], function(sca){
						var att_val = sca["localName"];
						atr_names.push( {value: att_val, input: att_val} );
					})
				}
			})

			//from Sub Class
			_.each(klass["AllSubClasses"], function(supC){

				var cs_val = supC["localName"];
				var cs_list = Classes.findOne({name: cs_val});

				if (cs_list) {

					_.each(cs_list["Attributes"], function(sca){
						var att_val = sca["localName"];
						atr_names.push( {value: att_val, input: att_val} );
					})
				}
			})
		}

	 	//Chech for Optional-Negation check-boxes simultaneous active
	 	compart_type = CompartmentTypes.findOne({name: "Attributes", elementTypeId: act_el["elementTypeId"]});
	 	if (compart_type) {

	 		Compartments.find({compartmentTypeId: compart_type["_id"], elementId: Session.get("activeElement")}).forEach(function(c){
	 			if(c["subCompartments"]["Attributes"]["Attributes"]["IsNegation"]["input"] == "true" &&
	 				c["subCompartments"]["Attributes"]["Attributes"]["IsOptional"]["input"] == "true") {


	 				console.error("Choose optional OR negation type");

	 				// c["subCompartments"]["Attributes"]["Attributes"]["IsNegation"]["input"] =  "false";
	 				// c["subCompartments"]["Attributes"]["Attributes"]["IsOptional"]["input"] = "false";
	 				// Dialog.updateCompartmentValue(ct, "false", "", compart_id);
	 			}
	 		})
	 	}

	 	// return atr_names;
		atr_names = _.sortBy(atr_names, "input");
	 	var is_sorted = false;

	 	return _.uniq(atr_names, is_sorted, function(item) {
	 		return item["input"];
	 	});


	},

	VQsetIsGroup: function() {
		//arrow ->compartments->"Subquery Link"->extensions->after Update
		//params: (compartType, compartId)
	},

	VQsetIsCondition: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var lt ="PLAIN";
			 if (input=="true") { lt="CONDITION"};
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setNestingType(lt);
		}
	},

	VQsetIsSubquery: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var lt = "PLAIN";
			 if (input=="true") { lt="SUBQUERY"};
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setNestingType(lt);
		}
	},

	VQsetIsGlobalSubquery: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var lt = "PLAIN";
			 if (input=="true") { lt="GLOBAL_SUBQUERY"};
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setNestingType(lt);
		}
	},

	VQsetIsOptional: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var lt = "REQUIRED";
			 if (input=="true") { lt="OPTIONAL"};
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setLinkType(lt);
		}
	},

	VQsetIsNegation: function(params) {

		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var lt = "REQUIRED";
			 if (input=="true") { lt="NOT"};
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setLinkType(lt);
		}
	},

	VQsetNestingType: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var nestingType = params["value"];
			 var elem = new VQ_Element(c["elementId"]);
			 elem.setNestingType(nestingType);
		}
	},

	VQSetHideDefaultLinkName: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var input = params["input"];
			 var hide = (input == "true");
			 var elem = new VQ_Element(c["elementId"]);
			 elem.hideDefaultLinkName(hide);
		}
	},

	VQbeforeCreateLink: function(params) {
		console.log("VQbeforeCreateLink");
		// console.log(params);
		Interpreter.destroyErrorMsg();
		var startLink = new VQ_Element(params["startElement"]);
		var endLink = new VQ_Element(params["endElement"]);	 

		if (!startLink.isRoot() && !endLink.isRoot() &&
			 !(startLink.getLinkToRoot() === undefined) && !(endLink.getLinkToRoot() === undefined)) {
			//If both condition classes are connected to different query classes
			if (startLink.getRootId() != endLink.getRootId()){
				Interpreter.showErrorMsg("Condition (violet) classes of two queries can not be linked (to avoid two main classes in a query).", -3); 
				// To merge two queries, use a query class (orange) at least at one link end.", -3);
				return false;
			}
		} else if (startLink.isRoot() && !endLink.isRoot() && !(endLink.getLinkToRoot() === undefined)){
			Interpreter.showErrorMsg("Can't connect 2 queries this way to avoid two main classes in a query.");
			return false;
		} else if (!startLink.isRoot() && endLink.isRoot() && !(startLink.getLinkToRoot() === undefined)){
			Interpreter.showErrorMsg("Can't connect 2 queries this way to avoid two main classes in a query.");
			return false;
		}		 
		return true;
	},

	VQafterCreateLink: function(params) {
		console.log("VQafterCreateLink");
		//console.log(params);
		Interpreter.destroyErrorMsg();
		var link = new VQ_Element(params["_id"]);
		link.setLinkType("REQUIRED");		 
		if (link.getStartElement().isRoot() && link.getEndElement().isRoot()){
		 	link.getEndElement().setClassStyle("condition");
		} else if (!link.getStartElement().isRoot() && link.getEndElement().isRoot()) {
			if (link.getStartElement().getLinkToRoot().start == false){
				console.log("condition class has no connected query class")
			} else {
				link.getEndElement().setClassStyle("condition");
			}
		}
	},
	VQgetAssociationIsInverse: function() {
		////arrow ->compartments->Inverse link->extensions->dynamic default value
		//return: String
	},

	VQsetSubQueryInverseLink: function() {
		//arrow ->compartments->Inverse Link->extensions->after Update
		//params: (compartType, compartId)
		console.log("SSSAAASSS");
		var ct = CompartmentTypes.findOne({name: "Inverse Link"});
		var ctn = CompartmentTypes.findOne({name: "Name", elementTypeId: Session.get("activeElementType")});
		var act_elem = Session.get("activeElement");

		if (act_elem && ct && ctn) {
			var c = Compartments.findOne({elementId: act_elem, compartmentTypeId: ct["_id"]});
			var cn = Compartments.findOne({elementId: act_elem, compartmentTypeId: ctn["_id"]});
			var c_cal = Compartments.findOne({elementId: act_elem, input: {$nin: ["true", "false"]}});

			if (c && cn) {

				if (c["input"] == "true" && String(c_cal["value"]).indexOf("inv") == -1){

					// Dialog.updateCompartmentValue(ct, "true", "<inv>", c["_id"]);
					Dialog.updateCompartmentValue(ctn, "inv(".concat(cn["input"], ")"), "inv(".concat(cn["input"], ")"), cn["_id"]);
				}
				else if (c["input"] == "false" && String(c_cal["value"]).indexOf("inv") > -1) {
					var s = cn["value"].indexOf("(");
					var e = cn["value"].lastIndexOf(")");
					var name = cn["value"].substring(s + 1, e);

					// Dialog.updateCompartmentValue(ct, "false", "", c["_id"]);
					Dialog.updateCompartmentValue(ctn, name, name, cn["_id"]);
				}
			}
		}
	},

	VQgetAssociationName: function() {
		//arrow ->compartments->extensions->dynamic default value
		//return: String
	},

	VQsetLinkName: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var link = new VQ_Element(c["elementId"]);
			 link.hideDefaultLinkName(link.shouldHideDefaultLinkName());

			 link.setIsInverseLink(c["value"].substring(0,4)=="inv(");
		}
	},

	VQsetClassName: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			 var elem = new VQ_Element(c["elementId"]);
       _.each(elem.getLinks().map(function(l) {return l.link}), function(link) {
					link.hideDefaultLinkName(link.shouldHideDefaultLinkName());
			 });
		}
	},

	VQsetClassNameValue: function(params) {
		var c = Compartments.findOne({_id:params["compartmentId"]});
		if (c) {
			      var elem = new VQ_Element(c["elementId"]);
            if (elem.isIndirectClassMembership()) {
							elem.setNameValue(".. "+elem.getName());
						} else {
							elem.setNameValue(elem.getName());
						};
		};
	},

	VQsetIndirectClassMembershipDefaultValue: function(params) {
		var proj = Projects.findOne({_id: Session.get("activeProject")});
		console.log("A1");
		if (proj && proj.indirectClassMembershipRole) {
       console.log("A2");
			 return "true";
		} else {
       console.log("A3");
			 return "false";
		 };
	},

	VQSetHideDefaultLinkValue: function(a,b,c){
		var proj = Projects.findOne({_id: Session.get("activeProject")});
		if (proj && proj.autoHideDefaultPropertyName == "true") {
			 return "true";
		} else {
			 return "false";
		};
	},
	
	VQsetAssociationName: function(start, end) {
		var name_list = [];
		var start_class = Elements.findOne({_id: start});
		var end_class = Elements.findOne({_id: end});

		var compart_type = CompartmentTypes.findOne({name: "Name", elementTypeId: start_class["elementTypeId"]});
		var compart = Compartments.findOne({compartmentTypeId: compart_type["_id"], elementId: start});
		var compart_type_end = CompartmentTypes.findOne({name: "Name", elementTypeId: start_class["elementTypeId"]});
		var compart_end = Compartments.findOne({compartmentTypeId: compart_type_end["_id"], elementId: end});
		var schema = new VQ_Schema();
		if (schema.classExist(compart["input"]) && schema.classExist(compart_end["input"])) {
			var start_class = schema.findClassByName(compart["input"]);
			var end_class = schema.findClassByName(compart_end["input"]);
				
			var all_assoc_from_start = start_class.getAllAssociations();
			var all_sub_super_of_end = _.union(end_class.allSuperSubClasses,end_class);
			var possible_assoc_list = _.filter(all_assoc_from_start, function(a) {
				return _.find(all_sub_super_of_end, function(c) {
					return c.localName == a.class
				})
			});

			name_list = _.map(possible_assoc_list, function(assoc) {
				var assoc_name = assoc["name"];
				if (assoc["type"] == "<=") {
					assoc_name = "inv("+assoc_name+")";
				};
				return assoc_name;
			});
		}

		if(name_list.length == 1) return name_list[0];
		
		return ""
	},
	
	VQgetAssociationNames: function() {
		//arrow ->compartments->extensions-> dynamic drop down
		var act_elem = Session.get("activeElement");
		var name_list = {value: " ", input: " ", };
		if (act_elem) {
			var vq_link = new VQ_Element(act_elem);
			if (vq_link.isLink()) {
  				var myschema = new VQ_Schema();
				var start_class = myschema.findClassByName(vq_link.getStartElement().getName());
				var end_class = myschema.findClassByName(vq_link.getEndElement().getName());
				if (start_class && end_class) {
					var all_assoc_from_start = start_class.getAllAssociations();
					var all_sub_super_of_end = _.union(end_class.allSuperSubClasses,end_class);
					var possible_assoc_list = _.filter(all_assoc_from_start, function(a) {
					 	return _.find(all_sub_super_of_end, function(c) {
							 	return c.localName == a.class
					 	})
			  		});

					name_list = _.union(name_list, _.map(possible_assoc_list, function(assoc) {
							var assoc_name = assoc["name"];
							if (assoc["type"] == "<=") {
								assoc_name = "inv("+assoc_name+")";
							};

							return {value:assoc_name, input:assoc_name};
						}));
				};
			};
		};

		return name_list;
	},
	
	VQsetSubQueryNameSuffix: function(val) {
		//arrow ->compartments->extensions->dynamicSuffix
		//params: (value), return: String
		//vards zem bultas (ja neko neatgriez, tad panems vertibu, bet pieliks klat undescribed)
    //  console.log(val);
			return [val.value]
	},

	VQsetSubQueryNamePrefix: function(val) {
		//arrow ->compartments->extensions->dynamicPrefix
		//params: (value), return: String
		//vards zem bultas (ja neko neatgriez, tad panems vertibu, bet pieliks klat undescribed)
   //console.log(val);
		return [val.value]
	},
	
	VQgetOrderByFields: function(val) {
			
		//atribute value for class
		var act_elem = Session.get("activeElement");
		//Active element does not exist OR has no Name OR is of an unpropriate type
		if (!act_elem) {
			return [];
		}
		var act_comp = Compartments.findOne({elementId: act_elem})
		if (!act_comp) {
			return [];
		}

		var elem_type = ElementTypes.findOne({name: "Class"});
		if (elem_type && act_comp["elementTypeId"] != elem_type._id) {
			return [];
		}
		
		var order_by_list = [];

		var symbolTable = generateSymbolTable()
		for (var  key in symbolTable) {
			order_by_list.push({value: key, input: key});
		}

		var act_el = Elements.findOne({_id: act_elem}); //Check if element ID is valid

		if (act_el) {
		//check if Class name is defined for active element
			var compart_type = CompartmentTypes.findOne({name: "Name", elementTypeId: act_el["elementTypeId"]});

			if (!compart_type) {
				return order_by_list;
			}

			var compart = Compartments.findOne({compartmentTypeId: compart_type["_id"], elementId: act_elem});
			if (!compart) {
				return order_by_list;
			}

			//Read attribute values from DB
			var schema = new VQ_Schema();
			if (schema.classExist(compart["input"])) {
				var klass = schema.findClassByName(compart["input"]);

				_.each(klass.getAllAttributes(), function(att){
					var att_val = att["name"];
					order_by_list.push({value: att_val, input: att_val});
				})
			}
		}

	 	order_by_list = _.uniq(order_by_list, false, function(item) {
	 		return item["input"];
	 	});
		
		return order_by_list;
	},
	
	VQgetGroupByFields: function(val) {
		//atribute value for class
		var act_elem = Session.get("activeElement");
		//Active element does not exist OR has no Name OR is of an unpropriate type
		if (!act_elem) {
			return [];
		}
		var act_comp = Compartments.findOne({elementId: act_elem})
		if (!act_comp) {
			return [];
		}

		var elem_type = ElementTypes.findOne({name: "Class"});
		if (elem_type && act_comp["elementTypeId"] != elem_type._id) {
			return [];
		}
		
		var group_by_list = [];

		var symbolTable = generateSymbolTable();

		for (var  key in symbolTable) {
			for (var  k in symbolTable[key]) {
				if(symbolTable[key][k]["kind"] == "PROPERTY_NAME" || symbolTable[key][k]["kind"] == "PROPERTY_ALIAS" || symbolTable[key][k]["kind"] == "BIND_ALIAS" || symbolTable[key][k]["kind"] == "CLASS_ALIAS" || symbolTable[key][k]["kind"] == "AGGREGATE_ALIAS") group_by_list.push({value: key, input: key});
			}
		}
		
		group_by_list = _.uniq(group_by_list, false, function(item) {
	 		return item["input"];
	 	});
		
		return group_by_list;
	},

  // TODO: Dynamic Context Menus dont work
	getVQ_Class_ContextMenuEditMode: function() {
		var menu = [{item:"AddLink", procedure:"AddLink"},{item:"Copy", procedure:"Copy"},{item:"Delete", procedure:"Delete"},
		            {item:"Generate SPARQL from single class",procedure:"GenerateSPARQL_from_selection"},
							  {item:"Execute SPARQL from single class",procedure:"ExecuteSPARQL_from_selection"},
						    {item:"Generate SPARQL from component",procedure:"GenerateSPARQL_from_component"},
								{item:"Execute SPARQL from component",procedure:"ExecuteSPARQL_from_component"},
							];

		return menu;
	},

	createNewVQ_Element: function()  {
		var loc = {x:400,y:400,width:250,height:250};
		Create_VQ_Element(function(boo) {
			 boo.setName("Boo");
			 boo.addCondition("boo > voo");
			 boo.addCondition("zoo is not here");
			 boo.addField("kvak","a",true,true,true);
			 boo.addField("mooh","b",true,false,true);
			 boo.setDistinct(true);
			 boo.setOffset("333");
			 boo.setLimit("777");
			 boo.setFullSPARQL("Full SPARQL");
			 var loc2 = {x:400,y:800,width:200,height:200};
			 Create_VQ_Element(function(voo) {
				 voo.setName("Voo");
				 voo.setClassType("condition");
				 voo.addAggregateField("count(.)","zumzum");
				 voo.addAggregateField("sum(fum)","foo");
				 voo.addOrdering("cockoo",true);
				 voo.addOrdering("sparrow",false);
				 var points = [444, 800, 444, 650];
				 Create_VQ_Element(function(coo) {
					 coo.setName("Coo");
					 coo.setLinkType("REQUIRED");
					 coo.setNestingType("SUBQUERY");
				 }, points, true, voo, boo);
			 }, loc2);
		}, loc);
		//boo.setName("Boo");

	},

	visualizeSPARQL: function() {
		var query_text = yasqe3.getValue();
		Interpreter.customExtensionPoints.generateVisualQuery(query_text)
	},

	setIsVisibleFalse: function() {
		return false;
	},

	setIsVisibleTrue: function() {
		return true;
	},

	isAggregateWizardAvailable: function() {
		console.log("isAggregateWizardAvailable");
		return true;
	},

	AggregateWizard: function(e) {
// Template.AggregateWizard.defaultAlias = new ReactiveVar("No_class");
// Template.AggregateWizard.attList = new ReactiveVar([{attribute: "No_attribute"}]);
// Template.AggregateWizard.endClassId = new ReactiveVar("No end");

		console.log("AggregateWizard", e);

		var parent = $(e.target).closest(".compart-type");
		console.log("parent ", parent)

		var parent_id = parent.attr("id");
		console.log("parent_id ", parent_id)

		var compart_type = CompartmentTypes.findOne({_id: parent_id});
		console.log("compart_type", compart_type)

		// more elegant selection for subCompartmentTypes needed
		var expression_compart_type = _.find(compart_type.subCompartmentTypes[0].subCompartmentTypes, function(sub_compart_type) {
											return sub_compart_type.name == "Expression";
										});


		var exression_id = expression_compart_type._id
		console.log("exression_id ", exression_id)

		var expression_value = parent.find("." + exression_id).val();
		console.log("expression_value", expression_value)


		Interpreter.destroyErrorMsg();
		var attr_list = [{attribute: ""}];
        var schema = new VQ_Schema();
        var classId = Session.get("activeElement");
        Template.AggregateWizard.endClassId.set(classId);


        console.log("classId ", classId)


        if (classId) {
            var classObj = new VQ_Element(classId);
            if (classObj && classObj.isClass()) {
            	//Display/at least/at most visibility
            	if(classObj.isRoot()) {
            		Template.AggregateWizard.showDisplay.set("none");
            		Template.AggregateWizard.startClassId.set(classId);
            	}else {
            		var classUp = classObj.getLinkToRoot();
            		Template.AggregateWizard.showDisplay.set("block");
            		Template.AggregateWizard.linkId.set(classUp.link.obj._id);
            		//console.log("root id = ", getRootId(classObj.obj._id));
            		//Template.AggregateWizard.startClassId.set(getRootId(classObj.obj._id));
            		if (classUp.start) {
        				Template.AggregateWizard.startClassId.set(classUp.link.getElements().start.obj._id);
        			} else {
        				Template.AggregateWizard.startClassId.set(classUp.link.getElements().end.obj._id);
        			}            		
            	}

                //Attribute generation
                var class_name = classObj.getName();
                if (schema.classExist(class_name)) {
                    var klass = schema.findClassByName(class_name);

                    _.each(klass.getAllAttributes(), function(att){
                        attr_list.push({attribute: att["name"]});
                    })
                    attr_list = _.sortBy(attr_list, "attribute");
                }
                // console.log(attr_list);
                Template.AggregateWizard.attList.set(attr_list);

                //Alias name
                if (class_name) {
                	var userAlias = $("#479fc64e382dc2d31bdd0855 input").val();
                  	if (userAlias !="") {
                    	Template.AggregateWizard.defaultAlias.set(userAlias);                    
                 	} else {                    
                    	Template.AggregateWizard.defaultAlias.set(class_name.charAt(0) + "_count");
                    }
                    $("#aggregate-wizard-form").modal("show");
                } else {
                	Interpreter.showErrorMsg("No class name is given", -3);
                	return;
                }
            }
        }        
    },

	isMergeValuesWizardAvailable: function() {
		return true;
	},


	setIsVisibleForIndirectClassMembership: function() {
		var proj = Projects.findOne({_id: Session.get("activeProject")});
		if (proj) {
			  var directClassMembershipRole;
			  var indirectClassMembershipRole;
			  if (proj.directClassMembershipRole) directClassMembershipRole = proj.directClassMembershipRole;
			  else directClassMembershipRole = "";
			  if (proj.indirectClassMembershipRole)indirectClassMembershipRole =  proj.indirectClassMembershipRole;
			  else indirectClassMembershipRole = "";

			  if(directClassMembershipRole == indirectClassMembershipRole) return false;
			  return true;
		}
		return false;
	},

	//Adds outer query as [ ] class with ++ link
	addOuterQuery: function(){
		var selected_elem_id = Session.get("activeElement");
		if (Elements.findOne({_id: selected_elem_id})){ //Because in case of deleted element ID is still "activeElement"
			Interpreter.destroyErrorMsg();

			var currentElement = new VQ_Element(selected_elem_id);
			if (currentElement.isClass() && currentElement.isRoot()) {
				currentElement.setClassStyle("condition");
				//coordinates to place new Box and create link
				var d = 60; //distance between boxes
				var locClass = currentElement.getNewLocation(d); console.log(locClass);
				var coordX = locClass.x + Math.round(locClass.width/2);
				var coordY = locClass["y"] - d; 
				var locLink = [coordX, locClass.y, coordX, coordY];
				
				Create_VQ_Element(function(cl){
					cl.setName("[ ]");
					var proj = Projects.findOne({_id: Session.get("activeProject")});
					cl.setIndirectClassMembership(proj && proj.indirectClassMembershipRole);					
					Create_VQ_Element(function(lnk) {
						lnk.setName("++");
						lnk.setLinkType("REQUIRED");
						lnk.setNestingType("SUBQUERY");
						// var proj = Projects.findOne({_id: Session.get("activeProject")});
						// lnk.setIndirectClassMembership(proj && proj.indirectClassMembershipRole);
				 	}, locLink, true, cl, currentElement);
				 	
				 	var proj = Projects.findOne({_id: Session.get("activeProject")});
					cl.setIndirectClassMembership(proj && proj.indirectClassMembershipRole);
				}, locClass);											
			} else {
				Interpreter.showErrorMsg("Outer class can be added only to main query class (orange box).", -3);
			}

		} else {
			Interpreter.showErrorMsg("Outer class can be added only to main query class (orange box).", -3);
		}
	},

	//
	setAsMainClass: function(){
		Interpreter.destroyErrorMsg();
		//Based on "generate SPARQL from component" realisation
        var newMainElementID = Session.get("activeElement");        
        var selected_elem = new VQ_Element(newMainElementID);
        //Check if any action is needed
        if(!selected_elem.isClass()){
            console.log("Selected element is not class");
            return;
        }
        if (selected_elem.isRoot()){
        	return;
        }
        if(InsideNested(newMainElementID)){
        	Interpreter.showErrorMsg("Can't set class as Main inside Nested query.", -3);
        	return;
        }         
                       
        //Get ID of all elements in query
        var visited_elems = {};
        GetComponentIds(selected_elem);       
        var elem_ids = _.keys(visited_elems);
        var class_ids = [];

        //Get ID from selection of classes, that are query and set them as condition
        _.each(elem_ids, function(e){
            var VQElem = new VQ_Element(e);         
            if (VQElem.isClass() && VQElem.isRoot()){
            	VQElem.setClassStyle("condition");
            }
        })

        selected_elem.setClassStyle("query");

	    function InsideNested(id){
        	var vq_elem = new VQ_Element(id);
        	if (vq_elem.isRoot()){
        		return false;
        	} else {
        		if (vq_elem.getLinkToRoot()){
        			if (vq_elem.getLinkToRoot().link.isSubQuery()) {
        				return true;
        			}

        			var elements = vq_elem.getLinkToRoot().link.getElements();
        			if (vq_elem.getLinkToRoot().start) {
        				return InsideNested(elements.start.obj._id);
        			} else {
        				return InsideNested(elements.end.obj._id);
        			}
        		}
        	}
        }

        function GetComponentIds(vq_elem) {
            visited_elems[vq_elem._id()] = true;
            _.each(vq_elem.getLinks(),function(link) {
                if (!visited_elems[link.link._id()]) {
                    visited_elems[link.link._id()]=true;
                    var next_el = null;
                	if (link.start) {
                    	next_el=link.link.getStartElement(); 
                    } else {
                        next_el=link.link.getEndElement();
                    };

                    if (!visited_elems[next_el._id()]) {
                        GetComponentIds(next_el);
                    };
                };
            });
        };
	},

	
});


generateSymbolTable = function() {

	var editor = Interpreter.editor;
	var elem = _.keys(editor.getSelectedElements());
	var abstractQueryTable = {}
		
    // now we should find the connected classes ...
    if (elem) {
       var selected_elem = new VQ_Element(elem[0]);
       var visited_elems = {};

       function GetComponentIds(vq_elem) {
           visited_elems[vq_elem._id()]=true;
           _.each(vq_elem.getLinks(),function(link) {
               if (!visited_elems[link.link._id()]) {
                 visited_elems[link.link._id()]=true;
                 var next_el = null;
                 if (link.start) {
                   next_el=link.link.getStartElement();
                 } else {
                   next_el=link.link.getEndElement();
                 };
                 if (!visited_elems[next_el._id()]) {
                    GetComponentIds(next_el);
                 };
               };
           });
       };

       GetComponentIds(selected_elem);

       var elem_ids = _.keys(visited_elems);  
       var queries = genAbstractQueryForElementList(elem_ids, null);   
	    _.each(queries,function(q) {
		abstractQueryTable = resolveTypesAndBuildSymbolTable(q);
       })
    } else {
      // nothing selected
    }
	
	if(Session.get("activeElement") != null && typeof abstractQueryTable["symbolTable"] !== 'undefined' && typeof abstractQueryTable["symbolTable"][Session.get("activeElement")] !== 'undefined')return abstractQueryTable["symbolTable"][Session.get("activeElement")];
    return {};
  }
