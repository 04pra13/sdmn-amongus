import Image from "next/image";
import { redirect } from "next/navigation";
import Loading from "./loading";

export default function Home() {
  redirect("/dashboard");
  return (
    <Loading />
  );
}
