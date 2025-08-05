import { Router } from "express";
import { validateContract } from "@/middlewares";
import { ContractsExample } from "@/contracts/contract_example/contracts";
import {ExampleController} from "@/controllers/ExampleController";

export default function (router: Router) {

  router.get(
      "/test",
      validateContract(ContractsExample),
      ExampleController.mymethod
  );

  // => Prefer this approach for defining routes
  //    Easier to read and to stack middlewares
  // router.post(
  //   "/authed/important-fake-action",
  //   checkAuthentication,
  //   validateContract(MySuperFakeContract),
  //   MyController.action
  // );


  return router;
}
