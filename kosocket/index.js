//	Our remote data modelling function
//	TODO: ability to do thinsg when getter/setter is updated
//	probably use a pub/sub model.
//
//	. Ability to observe each item in the model
//	. Ability to observe changes to any part of the model
//
//
//
module.exports = function(io) {
	return function(values, nameSpace){


		//	TODO: Each namespace is shared with users connecting
		//	need separate NS per user, if we want different data...
		nameSpace = nameSpace || '/kosocket';
		var nsp = io.of(nameSpace),
			model = {},
			modelObs = [];

		//	Iterate on the model
		for(var i in values) {
			(function(key, value){
				model[key] = (function(value){
					var obs = [],
						prevValue;
					return {
						get: function(){
							return value;
						},
						set: function(val){
							//	Run the observers - if any return a false 
							//	value, cancel the set, and any other observers.
							var doSet = true, i;
							for(i = 0; i < obs.length; i +=1) {
								if(obs[i] && !obs[i](val)) {
									doSet = false;
									break;
								}
							}

							if(doSet) {
								prevValue = value;
								value = val;
								if(prevValue !== value) {
									nsp.emit(key, value);
									//	Run the model observers
									//	You cannot cancel from a model observer
									for(i = 0; i < modelObs.length; i +=1) {
										modelObs[i](key, value);
									}
								}
							}
						},
						observe: function(func) {
							//	Observes the setter
							obs.push(func);
						}
					}
				}(value));
			}(i, values[i]));
		}

		(function(model, nsp){
			//	Allow observers on the model
			//	params are key, value
			model.observe = function(func) {
				//	Observes the setter
				modelObs.push(func);
			};

			//	Setup the model on connection
			nsp.on('connection', function(socket){
				(function(model){
					for(var i in model) {
						(function(key, obj){
							if(obj.get) {
								nsp.emit(key, obj.get());
								//	When value is sent
								socket.on(key, function(data){
									obj.set(data);
								});
							}
						}(i, model[i]));
					}
				}(model));
			});
		}(model, nsp));

		return model;
	};
};