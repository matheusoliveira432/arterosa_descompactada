export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          ativo: boolean
          criada_em: string
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativo?: boolean
          criada_em?: string
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativo?: boolean
          criada_em?: string
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      categorias_financeiras: {
        Row: {
          ativo: boolean
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
        }
        Relationships: []
      }
      categorias_material: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          email: string | null
          id: string
          nome: string
          nome_loja: string | null
          whatsapp: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id?: string
          nome: string
          nome_loja?: string | null
          whatsapp: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          id?: string
          nome?: string
          nome_loja?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      cores: {
        Row: {
          ativo: boolean
          codigo_hex: string
          codigo_hex_2: string | null
          criada_em: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          codigo_hex: string
          codigo_hex_2?: string | null
          criada_em?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          codigo_hex?: string
          codigo_hex_2?: string | null
          criada_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      enderecos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cliente_id: string
          complemento: string | null
          criado_em: string
          estado: string | null
          id: string
          logradouro: string | null
          numero: string | null
          principal: boolean
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id: string
          complemento?: string | null
          criado_em?: string
          estado?: string | null
          id?: string
          logradouro?: string | null
          numero?: string | null
          principal?: boolean
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cliente_id?: string
          complemento?: string | null
          criado_em?: string
          estado?: string | null
          id?: string
          logradouro?: string | null
          numero?: string | null
          principal?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "enderecos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_metricas: {
        Row: {
          alcance: number
          ano: number
          id: string
          interacoes: number
          mes: number
          visitas_perfil: number
          visualizacoes: number
        }
        Insert: {
          alcance?: number
          ano: number
          id?: string
          interacoes?: number
          mes: number
          visitas_perfil?: number
          visualizacoes?: number
        }
        Update: {
          alcance?: number
          ano?: number
          id?: string
          interacoes?: number
          mes?: number
          visitas_perfil?: number
          visualizacoes?: number
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          id: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          variacao_cor_id: string | null
        }
        Insert: {
          id?: string
          pedido_id: string
          preco_unitario: number
          produto_id: string
          quantidade: number
          subtotal: number
          variacao_cor_id?: string | null
        }
        Update: {
          id?: string
          pedido_id?: string
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          subtotal?: number
          variacao_cor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_variacao_cor_id_fkey"
            columns: ["variacao_cor_id"]
            isOneToOne: false
            referencedRelation: "variacoes_cor"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          ativo: boolean
          categoria_material_id: string | null
          conteudo_quantidade: number | null
          conteudo_unidade: string | null
          criado_em: string
          id: string
          nome: string
          preco_compra: number
          unidade_compra_id: string | null
        }
        Insert: {
          ativo?: boolean
          categoria_material_id?: string | null
          conteudo_quantidade?: number | null
          conteudo_unidade?: string | null
          criado_em?: string
          id?: string
          nome: string
          preco_compra?: number
          unidade_compra_id?: string | null
        }
        Update: {
          ativo?: boolean
          categoria_material_id?: string | null
          conteudo_quantidade?: number | null
          conteudo_unidade?: string | null
          criado_em?: string
          id?: string
          nome?: string
          preco_compra?: number
          unidade_compra_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_categoria_material_id_fkey"
            columns: ["categoria_material_id"]
            isOneToOne: false
            referencedRelation: "categorias_material"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_unidade_compra_id_fkey"
            columns: ["unidade_compra_id"]
            isOneToOne: false
            referencedRelation: "unidades_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          criado_em: string
          id: string
          motivo: string | null
          pedido_id: string | null
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          variacao_cor_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          motivo?: string | null
          pedido_id?: string | null
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          variacao_cor_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          motivo?: string | null
          pedido_id?: string | null
          quantidade?: number
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
          variacao_cor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_variacao_cor_id_fkey"
            columns: ["variacao_cor_id"]
            isOneToOne: false
            referencedRelation: "variacoes_cor"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_status_historico: {
        Row: {
          alterado_por: string | null
          criado_em: string
          id: string
          pedido_id: string
          status_anterior: Database["public"]["Enums"]["status_pedido"] | null
          status_novo: Database["public"]["Enums"]["status_pedido"]
        }
        Insert: {
          alterado_por?: string | null
          criado_em?: string
          id?: string
          pedido_id: string
          status_anterior?: Database["public"]["Enums"]["status_pedido"] | null
          status_novo: Database["public"]["Enums"]["status_pedido"]
        }
        Update: {
          alterado_por?: string | null
          criado_em?: string
          id?: string
          pedido_id?: string
          status_anterior?: Database["public"]["Enums"]["status_pedido"] | null
          status_novo?: Database["public"]["Enums"]["status_pedido"]
        }
        Relationships: [
          {
            foreignKeyName: "pedido_status_historico_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          atualizado_em: string
          cliente_id: string
          criado_em: string
          endereco_id: string | null
          id: string
          numero: number
          observacoes: string | null
          status: Database["public"]["Enums"]["status_pedido"]
          valor_total: number
        }
        Insert: {
          atualizado_em?: string
          cliente_id: string
          criado_em?: string
          endereco_id?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          valor_total?: number
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string
          criado_em?: string
          endereco_id?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_pedido"]
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_endereco_id_fkey"
            columns: ["endereco_id"]
            isOneToOne: false
            referencedRelation: "enderecos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_admin: {
        Row: {
          criado_em: string
          nome: string | null
          papel: Database["public"]["Enums"]["papel_admin"]
          user_id: string
          usuario: string
        }
        Insert: {
          criado_em?: string
          nome?: string | null
          papel?: Database["public"]["Enums"]["papel_admin"]
          user_id: string
          usuario: string
        }
        Update: {
          criado_em?: string
          nome?: string | null
          papel?: Database["public"]["Enums"]["papel_admin"]
          user_id?: string
          usuario?: string
        }
        Relationships: []
      }
      produto_imagens: {
        Row: {
          id: string
          ordem: number
          produto_id: string
          url: string
        }
        Insert: {
          id?: string
          ordem?: number
          produto_id: string
          url: string
        }
        Update: {
          id?: string
          ordem?: number
          produto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_imagens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_materiais: {
        Row: {
          id: string
          material_id: string
          produto_id: string
          rendimento: number
        }
        Insert: {
          id?: string
          material_id: string
          produto_id: string
          rendimento: number
        }
        Update: {
          id?: string
          material_id?: string
          produto_id?: string
          rendimento?: number
        }
        Relationships: [
          {
            foreignKeyName: "produto_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_materiais_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          categoria_id: string
          criado_em: string
          descricao: string | null
          id: string
          nome: string
          preco_base: number
          slug: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          categoria_id: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome: string
          preco_base: number
          slug: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          categoria_id?: string
          criado_em?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco_base?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria_id: string | null
          criado_em: string
          data_pagamento: string | null
          data_transacao: string
          data_vencimento: string | null
          descricao: string
          id: string
          pedido_id: string | null
          status_pagamento: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          valor: number
        }
        Insert: {
          categoria_id?: string | null
          criado_em?: string
          data_pagamento?: string | null
          data_transacao?: string
          data_vencimento?: string | null
          descricao: string
          id?: string
          pedido_id?: string | null
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          valor: number
        }
        Update: {
          categoria_id?: string | null
          criado_em?: string
          data_pagamento?: string | null
          data_transacao?: string
          data_vencimento?: string | null
          descricao?: string
          id?: string
          pedido_id?: string | null
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo?: Database["public"]["Enums"]["tipo_transacao"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_compra: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      variacoes_cor: {
        Row: {
          ativo: boolean
          cor_id: string
          estoque_atual: number
          estoque_minimo: number
          foto_url: string | null
          id: string
          produto_id: string
        }
        Insert: {
          ativo?: boolean
          cor_id: string
          estoque_atual?: number
          estoque_minimo?: number
          foto_url?: string | null
          id?: string
          produto_id: string
        }
        Update: {
          ativo?: boolean
          cor_id?: string
          estoque_atual?: number
          estoque_minimo?: number
          foto_url?: string | null
          id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variacoes_cor_cor_id_fkey"
            columns: ["cor_id"]
            isOneToOne: false
            referencedRelation: "cores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variacoes_cor_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ajustar_estoque: {
        Args: {
          p_motivo?: string
          p_novo_estoque: number
          p_variacao_id: string
        }
        Returns: undefined
      }
      alterar_status_pedido: {
        Args: {
          p_pedido_id: string
          p_status: Database["public"]["Enums"]["status_pedido"]
        }
        Returns: undefined
      }
      criar_pedido: {
        Args: {
          p_cliente: Json
          p_endereco: Json
          p_itens: Json
          p_observacoes?: string
        }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      revalidar_carrinho: {
        Args: { p_variacoes: string[] }
        Returns: {
          cor_nome: string
          disponivel: boolean
          estoque: number
          preco: number
          produto_id: string
          produto_nome: string
          variacao_cor_id: string
        }[]
      }
    }
    Enums: {
      papel_admin: "admin"
      status_pagamento: "pendente" | "pago" | "cancelado"
      status_pedido:
        | "pendente"
        | "em_producao"
        | "pronto_envio"
        | "concluido"
        | "cancelado"
      tipo_movimentacao: "entrada" | "saida" | "ajuste"
      tipo_transacao: "entrada" | "saida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      papel_admin: ["admin"],
      status_pagamento: ["pendente", "pago", "cancelado"],
      status_pedido: [
        "pendente",
        "em_producao",
        "pronto_envio",
        "concluido",
        "cancelado",
      ],
      tipo_movimentacao: ["entrada", "saida", "ajuste"],
      tipo_transacao: ["entrada", "saida"],
    },
  },
} as const
