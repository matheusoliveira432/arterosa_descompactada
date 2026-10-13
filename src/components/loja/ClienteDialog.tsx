import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clienteSchema, type ClienteForm } from "@/lib/schemas";
import { mascaraCep, mascaraWhatsapp } from "@/lib/format";
import { useClienteStore } from "@/store/cliente";

export function ClienteDialog({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const dados = useClienteStore((s) => s.dados);
  const salvar = useClienteStore((s) => s.salvar);

  const form = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      whatsapp: "",
      nome_loja: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  useEffect(() => {
    if (aberto && dados) form.reset(dados);
  }, [aberto, dados, form]);

  const onSubmit = (valores: ClienteForm) => {
    salvar(valores);
    toast.success("Seus dados foram salvos!");
    aoFechar();
  };

  const campo = (
    nome: keyof ClienteForm,
    rotulo: string,
    extras?: { placeholder?: string; mascara?: (v: string) => string; className?: string },
  ) => (
    <div className={extras?.className}>
      <Label htmlFor={nome} className="text-sm">
        {rotulo}
      </Label>
      <Input
        id={nome}
        placeholder={extras?.placeholder}
        className="mt-1 h-11 rounded-xl"
        {...form.register(
          nome,
          extras?.mascara
            ? { onChange: (e) => form.setValue(nome, extras.mascara!(e.target.value)) }
            : {},
        )}
      />
      {form.formState.errors[nome] ? (
        <p className="mt-1 text-xs text-destructive">
          {form.formState.errors[nome]?.message as string}
        </p>
      ) : null}
    </div>
  );

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v ? aoFechar() : undefined)}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Seus dados</DialogTitle>
          <DialogDescription>
            Precisamos deles para preparar e entregar o seu pedido. Você pode alterar quando quiser.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {campo("nome", "Nome completo", { placeholder: "Maria da Silva" })}
          {campo("whatsapp", "WhatsApp", {
            placeholder: "(12) 99999-9999",
            mascara: mascaraWhatsapp,
          })}
          <div className="grid gap-4 sm:grid-cols-2">
            {campo("nome_loja", "Nome da loja (opcional)")}
            {campo("email", "E-mail (opcional)")}
          </div>

          <p className="pt-2 text-sm font-semibold">Endereço de entrega</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {campo("cep", "CEP", { placeholder: "00000-000", mascara: mascaraCep })}
            {campo("logradouro", "Rua", { className: "sm:col-span-2" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {campo("numero", "Número")}
            {campo("complemento", "Complemento (opcional)", { className: "sm:col-span-2" })}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {campo("bairro", "Bairro")}
            {campo("cidade", "Cidade")}
            {campo("estado", "UF", { placeholder: "SP" })}
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl text-base">
            Salvar meus dados
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
