export interface Pessoa {
  id: number,
  nome: string,
  cpf: string,
  dataNascimento: string,
  contatos: Contato[]
}

export interface Contato {
  id: number,
  nome: string,
  telefone: string,
  email: string
}

export interface Pageable<T> {
  content: T[],
  pageable: {
    pageNumber: number,
    pageSize: number
  },
  totalElements: number,
  totalPages: number
}
