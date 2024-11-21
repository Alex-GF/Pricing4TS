include "../../PricingModel.mzn";

% C2: All features linked to a usage limit included within a plan are afected by its restriction.

constraint
  if num_plans > 0 /\ num_usage_limits > 0 
    then assert(forall(i in PLANS, j in FEATURES, k in USAGE_LIMITS)(
      if linked_features[k,j] == 1 /\ plans_features[i,j] == 1
        then plans_usage_limits[i,k] > 0
      endif
    ), "Invalid datafile. The value of all usage limits whose linked_features are in a plan must be > 0")
  endif;

% C3: All add-ons must be available for, at least, one plan

constraint
  if num_addons > 0 /\ num_plans > 0
    then forall(i in ADDONS)(
      sum(j in PLANS)(addons_available_for[i,j]) > 0
    )
  endif;