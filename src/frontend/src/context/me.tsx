import {createContext, PropsWithChildren, useContext} from "react";
import {Me} from "../declarations/api";
import {useMeQuery} from "../clients/member";
import {LoadingScreen} from "../screens/LoadingScreen";
import {ErrorScreen} from "../screens/ErrorScreen";

const MeContext = createContext<Me | undefined>(undefined);

export const MeProvider = ({children}: PropsWithChildren) => {
  const meQuery = useMeQuery();

  if (meQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (meQuery.isError || !meQuery.data) {
    return (
      <ErrorScreen error={`${meQuery.error}` ?? "Unknown error occured"} />
    );
  }

  return (
    <MeContext.Provider value={meQuery.data}>{children}</MeContext.Provider>
  );
};

export const useMe = () => {
  const me = useContext(MeContext);
  if (!me) throw new Error("useMe must be used within a MeProvider");
  return me;
};
