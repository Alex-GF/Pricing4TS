include "../validation/valid-subscription.mzn";

solve satisfy;

output [
  "Selected plan = ", show(selected_plan), "\n",
  "Selected addons = ", show(selected_addons), "\n",
  "Features included in subscription = ", show(subscription_features), "\n",
  "Usage Limits included in subscription = ", show(subscription_usage_limits)
];