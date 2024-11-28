include "../../PricingModel.mzn";

% C1: A pricing cannot be empty

constraint
  assert(num_plans > 0 \/ num_addons > 0, "Invalid datafile. A pricing cannot be empty, there have to be at least one plan or one add-on.");

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
    then assert(forall(i in ADDONS)(
      sum(j in PLANS)(addons_available_for[i,j]) > 0
    ), "Invalid datafile. All add-ons must be available for at least one plan.")
  endif;

% C4: No two plans should be exactly the same

constraint
  if num_plans > 1
    then assert(forall(i, j in PLANS where i < j)(
      exists(k in FEATURES)(
        plans_features[i,k] != plans_features[j,k]
      ) \/
      exists(k in USAGE_LIMITS)(
        plans_usage_limits[i,k] != plans_usage_limits[j,k]
      )
    ), "Invalid datafile. No two plans should be exactly the same.")
  endif;

% C5: No two addons should be exactly the same

constraint
  if num_addons > 1
    then assert(forall(i, j in ADDONS where i < j)(
      exists(k in FEATURES)(
        addons_features[i,k] != addons_features[j,k]
      ) \/
      exists(k in USAGE_LIMITS)(
        addons_usage_limits[i,k] != addons_usage_limits[j,k]
      ) \/
      exists(k in USAGE_LIMITS)(
        addons_usage_limits_extensions[i,k] != addons_usage_limits_extensions[j,k]
      ) \/
      exists(k in PLANS)(
        addons_available_for[i,k] != addons_available_for[j,k]
      ) \/
      exists(k in ADDONS)(
        addons_depends_on[i,k] != addons_depends_on[j,k]
      ) \/
      exists(k in ADDONS)(
        addons_excludes[i,k] != addons_excludes[j,k]
      )
    ), "Invalid datafile. No two addons should be exactly the same.")
  endif;