import { render, screen } from '@testing-library/react';

import Field from '../Field';
import Input from '../Input';

/**
 * `Field`in TEK işi erişilebilirlik bağlarını ÜRETMEK. Bu bağlar elle
 * yazıldığında kaçınılmaz olarak bir yerde atlanıyor ve ekran okuyucu hata
 * mesajını hiç okumuyordu — bu dosya o sözleşmenin nöbetçisi.
 */
describe('Field', () => {
  it('etiketi girdiye `htmlFor`/`id` ile bağlar', () => {
    render(
      <Field label="E-posta">{props => <Input {...props} type="email" defaultValue="" />}</Field>,
    );

    expect(screen.getByLabelText('E-posta')).toBeInTheDocument();
  });

  it('hata varken `aria-invalid` ve `aria-describedby` yazılır', () => {
    render(
      <Field label="E-posta" error="Geçersiz adres">
        {props => <Input {...props} type="email" defaultValue="" />}
      </Field>,
    );

    const input = screen.getByLabelText('E-posta');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
    expect(screen.getByRole('alert')).toHaveTextContent('Geçersiz adres');
  });

  /* BU TEST TERSINE CEVRILDI — ve gerekcesi olculebilir. */
  it('hata varken yardım metni de KALIR', () => {
    render(
      <Field label="E-posta" hint="Fatura buraya gider" error="Geçersiz adres">
        {props => <Input {...props} defaultValue="" />}
      </Field>,
    );

    expect(screen.getByText('Fatura buraya gider')).toBeInTheDocument();
    expect(screen.getByText('Geçersiz adres')).toBeInTheDocument();

    /* Hata ONCE: onemli olan neyin yanlis oldugu. */
    const [first] = (
      screen.getByRole('textbox').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(first as string)).toHaveTextContent('Geçersiz adres');
  });

  it('hata yokken yardım metni girdiye bağlanır', () => {
    render(
      <Field label="E-posta" hint="Fatura buraya gider">
        {props => <Input {...props} defaultValue="" />}
      </Field>,
    );

    const input = screen.getByLabelText('E-posta');
    const hint = screen.getByText('Fatura buraya gider');

    expect(input).toHaveAttribute('aria-describedby', hint.id);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  /*
   * Yildiz yalnizca GORSEL bir kisayol: renk ve sekil tek basina anlam
   * tasiyamaz (WCAG 1.4.1), bu yuzden ayrica gorunmez bir metin ve girdide
   * `required` ozniteligi olmak zorunda.
   */
  it('zorunlu alan yıldızın YANINDA okunabilir bir metin taşır', () => {
    render(
      <Field label="Ad" isRequired requiredLabel="(zorunlu)">
        {props => <Input {...props} defaultValue="" />}
      </Field>,
    );

    expect(screen.getByText('(zorunlu)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Ad/)).toBeRequired();
  });

  it('gizli etiket ekran okuyucuda KALIR', () => {
    render(
      <Field label="Ara" isLabelHidden>
        {props => <Input {...props} defaultValue="" />}
      </Field>,
    );

    expect(screen.getByLabelText('Ara')).toBeInTheDocument();
  });
});
