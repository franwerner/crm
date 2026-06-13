import type { Context } from 'hono'
import type { ContactAddChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-add-channel.use-case'
import type { ContactUpdateChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-update-channel.use-case'
import type { ContactRemoveChannelUseCase } from '@modules/contacts/application/use-cases/channel/contact-remove-channel.use-case'
import type { AddChannelRequest, UpdateChannelRequest } from '@modules/contacts/http/dto/in/contact-channel.in'
import { toContactView } from './view-mappers'

export interface ContactChannelUseCases {
  addChannel: ContactAddChannelUseCase
  updateChannel: ContactUpdateChannelUseCase
  removeChannel: ContactRemoveChannelUseCase
}

export class ContactChannelController {
  constructor(private readonly ucs: ContactChannelUseCases) {}

  async addChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const body = c.req.valid('json' as never) as AddChannelRequest

    const contact = await this.ucs.addChannel.execute({
      contactId,
      channelType: body.channelType,
      value: body.value,
      isPrimary: body.isPrimary,
    })

    return c.json(toContactView(contact), 200)
  }

  async updateChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const channelId = c.req.param('channelId') as string
    const body = c.req.valid('json' as never) as UpdateChannelRequest

    const contact = await this.ucs.updateChannel.execute({
      contactId,
      channelId,
      channelType: body.channelType,
      value: body.value,
      isPrimary: body.isPrimary,
    })

    return c.json(toContactView(contact), 200)
  }

  async removeChannel(c: Context): Promise<Response> {
    const contactId = c.req.param('id') as string
    const channelId = c.req.param('channelId') as string

    const contact = await this.ucs.removeChannel.execute({ contactId, channelId })

    return c.json(toContactView(contact), 200)
  }
}
