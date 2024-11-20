In this case we have 2 addons `A` and `B`, in order to
buy addon `A` you have to purchase previously addon `B` and viceversa.
We would not be able to purchase any of them.

We can model this in `Pricing2Yaml` using optional field `dependsOn` on 
both addOns.
