import {createContract} from "@/contracts";
import {ExampleSchema} from "@/contracts/contract_example/schemas";


export const ContractsExample = createContract()
    .query(ExampleSchema)
    .build()