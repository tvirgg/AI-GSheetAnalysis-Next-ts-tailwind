// app/context/TableContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface TableContextProps {
  tableName: string;
  setTableName: (name: string) => void;
}

export const TableContext = createContext<TableContextProps>({
  tableName: '',
  setTableName: () => {},
});

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [tableName, setTableName] = useState<string>('');

  return (
    <TableContext.Provider value={{ tableName, setTableName }}>
      {children}
    </TableContext.Provider>
  );
};
