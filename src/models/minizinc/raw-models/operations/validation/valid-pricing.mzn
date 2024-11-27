include "../../PricingModel.mzn";

% C2: All features linked to a usage limit included within a plan are afected by its restriction.

constraint
  if num_plans > 0 /\ num_usage_limits > 0 
    then assert(forall(i in PLANS, j in FEATURES)(
      if sum(k in USAGE_LIMITS)(linked_features[k,j] == 1 /\ plans_features[i,j] == 1) > 0 % Si hay al menos un límite de uso vinculado a la característica j, que está incluída en el plan i
        then sum(k in USAGE_LIMITS)(linked_features[k,j] == 1 /\ plans_usage_limits[i,k] > 0) > 0 % Entonces, al menos uno de esos límites de uso debe tener un valor mayor a 0
      endif
    ), "Invalid datafile. At least one usage limit linked to a feature in a plan must have a value > 0")
  endif;

% C3: All add-ons must be available for, at least, one plan

constraint
  if num_addons > 0 /\ num_plans > 0
    then forall(i in ADDONS)(
      sum(j in PLANS)(addons_available_for[i,j]) > 0
    )
  endif;