// src/components/storefront/CheckoutMobileForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CartItem, ModeLivraison, StoreFront } from '@/types';
import { Loader2, MessageCircle } from 'lucide-react';

const schema = z.object({
  modeLivraison: z.nativeEnum(ModeLivraison),
  telephoneLivraison: z.string().min(8, 'Téléphone requis'),
  adresseLivraison: z.string().optional(),
  nomClient: z.string().optional(),
}).refine((data) => {
  if (data.modeLivraison === ModeLivraison.LIVRAISON) {
    return !!data.adresseLivraison && data.adresseLivraison.length > 0;
  }
  return true;
}, { message: 'Adresse requise pour la livraison', path: ['adresseLivraison'] });

type FormData = z.infer<typeof schema>;

interface CheckoutMobileFormProps {
  storefront: StoreFront;
  items: CartItem[];
  subtotal: number;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  defaultValues?: Partial<FormData>;
}

const formatPrix = (prix: number) => {
  return new Intl.NumberFormat('fr-GN', { style: 'decimal' }).format(prix) + ' GNF';
};

export const CheckoutMobileForm = ({
  storefront,
  items,
  subtotal,
  onSubmit,
  isLoading,
  defaultValues,
}: CheckoutMobileFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      modeLivraison: ModeLivraison.LIVRAISON,
      telephoneLivraison: '',
      adresseLivraison: '',
      nomClient: '',
      ...defaultValues,
    },
  });

  const modeLivraison = form.watch('modeLivraison');
  const fraisLivraison = modeLivraison === ModeLivraison.LIVRAISON ? storefront.fraisLivraison : 0;
  const total = subtotal + fraisLivraison;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Mode de livraison */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Mode de livraison</Label>
        <RadioGroup
          value={modeLivraison}
          onValueChange={(v) => form.setValue('modeLivraison', v as ModeLivraison)}
          className="space-y-2"
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value={ModeLivraison.LIVRAISON} id="livraison" />
            <Label htmlFor="livraison" className="flex-1 cursor-pointer">
              <span className="font-medium">Livraison à domicile</span>
              <span className="block text-sm text-muted-foreground">
                {formatPrix(storefront.fraisLivraison)}
              </span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value={ModeLivraison.RETRAIT_BOUTIQUE} id="retrait" />
            <Label htmlFor="retrait" className="flex-1 cursor-pointer">
              <span className="font-medium">Retrait en boutique</span>
              <span className="block text-sm text-muted-foreground">Gratuit</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Coordonnées */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Vos coordonnées</Label>

        <div>
          <Label htmlFor="nomClient">Votre nom</Label>
          <Input
            id="nomClient"
            placeholder="Nom complet"
            className="h-12 mt-1"
            {...form.register('nomClient')}
          />
        </div>

        <div>
          <Label htmlFor="telephoneLivraison">Téléphone *</Label>
          <Input
            id="telephoneLivraison"
            type="tel"
            placeholder="+224 6XX XXX XXX"
            className="h-12 mt-1"
            {...form.register('telephoneLivraison')}
          />
          {form.formState.errors.telephoneLivraison && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.telephoneLivraison.message}
            </p>
          )}
        </div>

        {modeLivraison === ModeLivraison.LIVRAISON && (
          <div>
            <Label htmlFor="adresseLivraison">Adresse de livraison *</Label>
            <Input
              id="adresseLivraison"
              placeholder="Quartier, rue, repère..."
              className="h-12 mt-1"
              {...form.register('adresseLivraison')}
            />
            {form.formState.errors.adresseLivraison && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.adresseLivraison.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Récapitulatif */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold">Récapitulatif</h3>
        <div className="flex justify-between text-sm">
          <span>{items.length} article{items.length > 1 ? 's' : ''}</span>
          <span>{formatPrix(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Livraison</span>
          <span>{formatPrix(fraisLivraison)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span className="text-primary">{formatPrix(total)}</span>
        </div>
      </div>

      <Button type="submit" className="w-full h-14 text-base" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 mr-2" />
            Valider et envoyer
          </>
        )}
      </Button>
    </form>
  );
};
