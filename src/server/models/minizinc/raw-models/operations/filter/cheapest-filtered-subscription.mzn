include "./filter.mzn";

var float: subscription_cost = if num_plans > 0 then plans_prices[selected_plan] else 0 endif +
  if num_addons > 0 then sum(a in ADDONS)(selected_addons[a] * addons_prices[a]) else 0 endif;

% The price of the subscription cannot exceed maxPricing, and must surpass min_price

constraint subscription_cost >= min_price;
constraint subscription_cost <= max_price;

solve minimize subscription_cost;

output [
  "Selected plan = ", show(selected_plan), "\n",
  "Selected addons = ", show(selected_addons), "\n",
  "Features included in subscription = ", show(subscription_features), "\n",
  "Usage Limits included in subscription = ", show(subscription_usage_limits), "\n",
  "Subscription cost = ", show(subscription_cost)
];