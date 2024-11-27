In this case we have 1 addon `foo` that in order to be purchased
a nonexistent addon `bar` in the pricing has to be purchaed previosly

We can model this in `Pricing2Yaml` putting the key of the nonexistent addon `bar`
inside the optional list field `dependsOn` on addon `foo`.
