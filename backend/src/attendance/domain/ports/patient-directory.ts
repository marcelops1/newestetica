/* Comunicação explícita entre contextos (design decisão 3): o domínio de Atendimento
   declara a leitura que precisa do contexto de Pacientes, com a visibilidade no nome.
   A implementação consulta a tabela Patient com o filtro `status: "active"` — SEM
   importar o domínio de Pacientes (bounded contexts não conhecem detalhes internos
   um do outro; a porta do consumidor é o contrato). */
export type VisiblePatient = {
  id: string;
};

export interface PatientDirectory {
  findVisiblePatient(id: string): Promise<VisiblePatient | null>;
}
